import gulp from "gulp";
import yargs from "yargs";
import dartSass from "sass";
import gulpSass from "gulp-sass";
import CleanCSS from "gulp-clean-css";
import gulpIf from "gulp-if";
import sourcemaps from "gulp-sourcemaps";
import imagemin from "gulp-imagemin";
import del from "del";
import webpack from "webpack-stream";
import uglify from "gulp-uglify";
import named from "vinyl-named";
import zip from "gulp-zip";
import replace from "gulp-replace";
import info from "./package.json";
import browserSync from "browser-sync";
import fs from "fs";

const server = browserSync.create();

const sass = gulpSass(dartSass);

const paths = {
  styles: {
    src: ["sass/style.scss"],
    dest: "dist/assets/css",
  },
  images: {
    src: "src/assets/images/**/*.{jpg,jpeg,png,svg,gif}",
    dest: "dist/assets/images",
  },
  scripts: {
    src: "js/main.js",
    dest: "dist/assets/js",
  },
  other: {
    src: ["src/assets/**/*", "!src/assets/{images,js,scss}", "!src/assets/{images,js,scss}/**/*"],
    dest: "dist/assets/",
  },
  packaged: {
    src: [
      "**/*",
      "!.vscode",
      "!node_modules{,/**}",
      "!packaged{,/**}",
      "!src{,/**}",
      "!.babelrc",
      "!.gitignore",
      "!gulpfile.babel.js",
      "!package-lock.json",
      "!package.json",
    ],
    dest: "packaged",
  },
};

const PRODUCTION = yargs.argv.prod;

export const serve = (done) => {
  server.init({
    // Update this to your actual WordPress development URL
    proxy: "http://localhost:3002/",
    open: false,
  });
  done();
};

export const reload = (done) => {
  server.reload();
  done();
};

export const clean = () => del(["css", "js/bundle.js", "images"]);

export const styles = () => {
  return gulp
    .src(paths.styles.src)
    .pipe(gulpIf(!PRODUCTION, sourcemaps.init()))
    .pipe(
      sass({
        quietDeps: true,
        silenceDeprecations: ["import", "legacy-js-api"],
      }).on("error", sass.logError)
    )
    .pipe(gulpIf(PRODUCTION, CleanCSS({ compatibility: "ie8" })))
    .pipe(gulpIf(!PRODUCTION, sourcemaps.write()))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(server.stream()); // Enable live reloading for CSS
};

export const images = () => {
  return gulp.src(paths.images.src).pipe(gulpIf(PRODUCTION, imagemin())).pipe(gulp.dest(paths.images.dest));
};

export const copy = () => {
  return gulp.src(paths.other.src).pipe(gulp.dest(paths.other.dest));
};

export const scripts = () => {
  return gulp
    .src(paths.scripts.src)
    .pipe(named())
    .pipe(
      webpack({
        module: {
          rules: [
            {
              test: /\.js$/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
        // mode: PRODUCTION ? "production" : "development",
        devtool: !PRODUCTION ? "inline-source-map" : false,
        output: {
          filename: "bundle.js",
        },
      })
    )
    .pipe(gulpIf(PRODUCTION, uglify()))
    .pipe(gulp.dest(paths.scripts.dest));
};

export const compress = () => {
  return gulp
    .src(paths.packaged.src)
    .pipe(replace("bat_bistro", info.name))
    .pipe(zip(`${info.name}.zip`))
    .pipe(gulp.dest(paths.packaged.dest));
};

export const watch = () => {
  // Watch SCSS files
  gulp.watch("sass/**/*.scss", gulp.series(styles, reload));

  // Watch JavaScript files
  gulp.watch("js/**/*.js", gulp.series(scripts, reload));

  // Watch theme PHP files
  gulp.watch(["**/*.php", "!node_modules/**"], reload);

  // Watch image files
  gulp.watch(paths.images.src, gulp.series(images, reload));

  // Watch other asset files
  gulp.watch(paths.other.src, gulp.series(copy, reload));
};

// Development task
export const dev = gulp.series(clean, gulp.parallel(styles, scripts, images, copy), serve, watch);

// Build task
export const build = gulp.series(clean, gulp.parallel(styles, scripts, images, copy));

// Bundle task for packaging
export const bundle = gulp.series(build, compress);

// Default task
export default dev;
