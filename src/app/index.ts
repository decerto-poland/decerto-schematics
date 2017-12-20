import * as utils from '@schematics/angular/strings';
import {apply, chain, mergeWith, Rule, SchematicContext, template, Tree, url} from '@angular-devkit/schematics';
import {Schema} from './schema';

// something needs this.
import 'rxjs/add/operator/mergeMap';

const constants = {
  dot: '.',
  js: 'js',
  ts: 'ts',
};
const versions = {
  ngrx: '^4.1.1',
  cdk: '^5.0.0-rc.2',
};

function updateAngularCli(json: any) {
  json.apps[0].styles = ['loading.scss', ...json.apps[0].styles];
  json.apps[0].environments.mock = 'environments/environment.mock.ts';
  json.defaults.styleExt = 'scss';
  return json;
}

function updateTsConfigApp(json: any) {
  json.exclude = ['wallabyTest.ts', ...json.exclude];
  return json
}

function updatePackageJson(json: any) {
  json.publishConfig = {
    'registry': 'https://nexus.decerto.pl/content/repositories/npm_releases/'
  };
  json.sasslintConfig = '.sass-lint.yml';
  json.dependencies = {
    '@ngrx/store': versions.ngrx,
    '@ngrx/router-store': versions.ngrx,
    '@ngrx/effects': versions.ngrx,
    '@ngrx/entity': versions.ngrx,
    '@ngrx/store-devtools': versions.ngrx,
    'classlist.js': '^1.1.20150312',
    ...json.dependencies,
  };
  json.devDependencies = {
    'angular2-template-loader': '^0.6.2',
    'jasmine-marbles': '^0.2.0',
    'json': '^9.0.6',
    'karma-phantomjs-launcher': '^1.0.4',
    'lcov-summary': '^1.0.1',
    'ngrx-store-freeze': '^0.2.0',
    'sass-lint': '^1.12.1',
    'wallaby-webpack': '0.0.45',
    ...json.devDependencies,
  };
  json.scripts = {
    ...json.scripts,
    'start:base': 'ng serve --port=4380',
    'start': 'npm run start:base -- --proxy-config proxy.conf.js',
    'start:mock': 'npm run start:base -- --environment=mock',
    'start:dev': 'npm run start:base -- --proxy-config proxy-external.conf.js',
    'build:app': 'npm run build -- --target=production --progress=false',
    'build:dev': 'npm run build -- --target=development --aot=true --progress=false --output-hashing=all',
    'ci': 'npm run lint && npm run coverage -- --browsers=PhantomJS --colors=false',
    'preci': 'npm install',
    'postci': 'npm run build:app',
    'coverage': 'ng test --code-coverage --single-run --progress=false',
    'postcoverage': 'lcov-summary coverage/lcov.info',
    'lint': 'ng lint && sass-lint -q -v',
  };

  return json;
}

function updateGitIgnore(sourceText: string) {
  return `${sourceText}\n*.iml\n`;
}

function updateIndexHtml(sourceText: string) {
  const loadingStyles = `<style type="text/css">
		body, html {
			height: 100%;
		}

		.app-loading {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			height: 100%;
		}

		.app-loading .spinner {
			height: 200px;
			width: 200px;
			animation: rotate 2s linear infinite;
			transform-origin: center center;
			position: absolute;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			margin: auto;
		}

		.app-loading .spinner .path {
			stroke-dasharray: 1, 200;
			stroke-dashoffset: 0;
			animation: dash 1.5s ease-in-out infinite;
			stroke-linecap: round;
			stroke: #ddd;
		}

		@keyframes rotate {
			100% {
				transform: rotate(360deg);
			}
		}

		@keyframes dash {
			0% {
				stroke-dasharray: 1, 200;
				stroke-dashoffset: 0;
			}
			50% {
				stroke-dasharray: 89, 200;
				stroke-dashoffset: -35px;
			}
			100% {
				stroke-dasharray: 89, 200;
				stroke-dashoffset: -124px;
			}
		}

	</style>`;
  const loadingSpinner = `<div class="app-loading">
		<div class="logo"></div>
		<svg class="spinner"
			 viewBox="25 25 50 50">
			<circle class="path"
					cx="50"
					cy="50"
					r="20"
					fill="none"
					stroke-width="2"
					stroke-miterlimit="10"></circle>
		</svg>
	</div>`;

  return sourceText
    .replace(/<\/head>/, `  ${loadingStyles}\n</head>`)
    .replace(/-root><\//, `-root>${loadingSpinner}</`)
}

function updatePolyfills(sourceText: string) {
  return sourceText
    .replace(/\/\/\s*(import\s*'core-js\/es6)/g, '$1')
    .replace(/\/\/\s*(import\s*'classlist)/, '$1');
}

function transformJson(filename: string, jsonTransformer: <T>(sourceJson: T) => T) {
  return transformContent(filename, (src) => src ? `${JSON.stringify(jsonTransformer(JSON.parse(src)), null, 2)}\n` : src)
}

function transformContent(filename: string, contentTransformer: (sourceText: string) => string) {
  return (host: Tree) => {
    const sourceText = host.exists(filename) ? host.read(filename)!.toString('utf-8') : '';
    const resultText = contentTransformer(sourceText);
    if (sourceText !== resultText) {
      host.overwrite(filename, resultText);
    }
    return host;
  };
}

export default function (options: Schema): Rule {
  console.log(JSON.stringify({options}, null, 2));

  options = options || {};
  const sourceDir = options.sourceDir || 'src';

  const rootFilesRules = [
    template({
      utils,
      ...options as object,
      ...constants,
      sourceDir,
    }),
  ];
  return (host: Tree, context: SchematicContext) => chain([

    (tree: Tree) => tree.delete('/karma.conf.js'),
    mergeWith(apply(url('./files/root'), rootFilesRules)),
    transformJson('package.json', updatePackageJson),
    transformContent('.gitignore', updateGitIgnore),
    transformJson('.angular-cli.json', updateAngularCli),
    transformJson(`${sourceDir}/tsconfig.app.json`, updateTsConfigApp),
    transformContent(`${sourceDir}/polyfills.ts`, updatePolyfills),
    transformContent(`${sourceDir}/styles.scss`, s => s.replace(/\/\*\s*(.*)\s*\*\//g, '// $1')),
    transformContent(`${sourceDir}/index.html`, updateIndexHtml),
  ])(host, context);
}
