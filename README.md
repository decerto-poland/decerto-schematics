# decerto-schematics
Decerto Extensions for Angular

## How to initialize app?

Fetch latest angular CLI.

```
npm install -g @angular/cli@latest
```

Initialize application in a standard way

```
ng new myApplication --prefix my --style scss --routing true --service-worker true
```

Install decerto-schematics

```
cd myApplication
npm install --save-dev @decerto/schematics@latest
```

Run one-time initializer

```
ng g app --collection=@decerto/schematics
```

## TODO list

- [ ] replace this prototype with code with 100% test coverage
- [ ] integrate with @ngrx/schematics
- [ ] generate application without need of initializer
- [ ] generate library
- [ ] add more schematics
