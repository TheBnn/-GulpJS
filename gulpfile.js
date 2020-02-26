"use strict";
//Using pacages

/*
* https://github.com/jonkemp/gulp-useref
* https://github.com/ben-eb/gulp-uncss
* https://github.com/ben-eb/gulp-csso
* https://github.com/vol7/shorthand
* https://github.com/koistya/gulp-csscomb
* https://www.npmjs.com/package/gulp-csslint
* https://github.com/bezoerb/gulp-htmlhint
* https://github.com/babel/gulp-babel
* https://una.im/gulp-local-psi/
*/


const gulp = require('gulp'),
    less = require('gulp-less'),
    csso = require('gulp-csso'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    rigger = require('gulp-rigger'),
    plumber = require('gulp-plumber'),
    browsersync = require('browser-sync').create(),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-clean');

//Prefixes
var autoprefixerList = [
    'Chrome >= 45',
    'Firefox ESR',
    'Edge >= 12',
    'Explorer >= 10',
    'iOS >= 9',
    'Safari >= 9',
    'Android >= 4.4',
    'Opera >= 30'
];

//Paths
var path = {
    src: {
        html: '_src/', //
        js: ['_src/js/common.js'], //        
        css: '_src/less/common.less', //
        img: '_src/img/**/*.*',
        fonts: '_src/fonts/**/*.*'
    },
    build: {
        html: '_build/',
        js: '_build/js/',
        css: '_build/css/',
        img: '_build/img/',
        fonts: '_build/fonts/'
    },
    watch: {
        html: ['_src/*.html',
            '_src/_sections/*.html',], //
        js: '_src/js/*.js', //
        css: ['_src/less/*.less'], //
        img: '_src/img/**/*.*',
        fonts: '_src/fonts/**/*.*'
    },
    clean: '_build'
};


//HTML
function genHTML() {
    return gulp.src(path.src.html + '*.html') //Get html bundles     
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html)) //Write file to folder
        .pipe(browsersync.stream());
};

//CSS
function genCSS() {
    return gulp.src(path.src.css)
        .pipe(plumber())
        .pipe(sourcemaps.init()) //инициализируем sourcemap
        .pipe(less())
        .pipe(autoprefixer({
            browsers: autoprefixerList
        }))
        .pipe(csso()) // Minify Code
        .pipe(rename({
            suffix: '.min'
        })) //Set name for final file
        .pipe(browsersync.stream())        
        .pipe(sourcemaps.write('./')) //  записываем sourcemap        
        .pipe(gulp.dest(path.build.css)); //Write file to folder
};

// //JS
function genJS() {
    return gulp.src(path.src.js) // получим файл common.js
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(sourcemaps.init()) //инициализируем sourcemap
        .pipe(rigger()) // импортируем все указанные файлы в common.js
        .pipe(uglify()) // минимизируем js
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./')) //  записываем sourcemap
        .pipe(gulp.dest(path.build.js)) // положим готовый файл
        .pipe(browsersync.stream()); 
};

//FONTS
function genFONTS() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts)) //Write file to folder
};

//IMG
function imgCompress() {
    return gulp.src(path.src.img)
        .pipe(imagemin())
        .pipe(gulp.dest(path.build.img))
};

function watchFiles() {
    gulp.watch(path.watch.css, gulp.series(genCSS));
    gulp.watch(path.watch.js, gulp.series(genJS));
    gulp.watch(path.watch.html, gulp.series(genHTML));
    gulp.watch(path.watch.img, gulp.series(imgCompress));
}
function clearBuild() {
    return gulp.src('_build', { read: false })
        .pipe(clean());
}

// BrowserSync
function browserSync(done) {
    browsersync.init({
        server: {
            baseDir: "./_build/",
            index: "index.html",
        },
        watchOptions: {
            ignoreInitial: true,
            ignored: '*.txt'
        },
        https: false,
        notify: false,
        port: 3000
    });
    done();
}

// BrowserSync Reload
function browserSyncReload(done) {
    browsersync.reload();
    done();
}

const js = gulp.series(genJS);
const css = gulp.series(genCSS);
const html = gulp.series(genHTML);

const img = gulp.series(imgCompress);

const build = gulp.series(clearBuild, genFONTS, genJS, genHTML, genCSS, imgCompress, gulp.parallel(watchFiles, browserSync)); //
const watch = gulp.parallel(watchFiles, browserSync);


// export tasks
exports.js = js;
exports.html = html;

exports.img = img;
exports.css = css;
exports.build = build;
exports.watch = watch;
exports.default = build;