# D3 Chart + FaberJS Layout - Case Study

This is a case study evaluating layouting of individual elements of D3 charts with the FaberJS layout engine.

# Commands

## Installing

The case study is built on the Node ecosystem so before attempting to do anything else, we need to install all the dependencies.

```
npm install
```

## Building

Gulp is used to automate repeatable tasks.

The build task will create a new build of the whole case study into the `dist` folder. To explore a built version, simply open the `dist/index.html` file in a browser.

```
npx gulp build
```

## Development

For development it is oftentimes very useful to automatically rebuild and reload an app. This case study uses Browsersync to implement this and the command to run a hot-reloadable live server is

```
npx gulp serve
```

or simply

```
npx gulp
```
