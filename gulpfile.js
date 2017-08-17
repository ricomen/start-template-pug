const autoprefixer  = require('autoprefixer');
const browserSync   = require('browser-sync').create();
const less          = require('gulp-less');
const mqpacker      = require('css-mqpacker');
const del           = require('del');
const gulp          = require('gulp');
const cache         = require('gulp-cache');
const cheerio       = require('gulp-cheerio');
const concat        = require('gulp-concat');
const csscomb       = require('gulp-csscomb');
const cssnano       = require('gulp-cssnano');
const gulpIf        = require('gulp-if');
const imagemin      = require('gulp-imagemin');
const notify        = require('gulp-notify');
const plumber       = require('gulp-plumber');
const postcss       = require('gulp-postcss');
const pug           = require('gulp-pug');
const rename        = require('gulp-rename');
const replace       = require('gulp-replace');
const sourcemaps    = require('gulp-sourcemaps');
const svgmin        = require('gulp-svgmin');
const svgstore      = require('gulp-svgstore');
const gutil         = require("gulp-util");
const spritesmith   = require('gulp.spritesmith');
const pngquant      = require('imagemin-pngquant');
const runSequence   = require('run-sequence');
const smartgrid     = require('smart-grid');
const webpack       = require('webpack');
const isDev         = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

/*
  webpack task start
 */
gulp.task('webpack:watch', () => {
  webpack(require('./webpack.config.js')).watch({
      aggregateTimeout: 100,
      poll: false
  }, handler);
});

gulp.task('webpack', function(cb) {
    webpack(require('./webpack.config.js')).run(function(err, stats) {
        handler(err, stats, cb);
    });
});

function handler(err, stats, callback) {
    var errors = stats.compilation.errors;

    if (err) throw new gutil.PluginError('webpack', err);

    if (errors.length > 0) {
        notify.onError({
            title: 'Webpack Error',
            message: '<%= error.message %>'            
        }).call(null, errors[0]);
    }

    gutil.log('[webpack]', stats.toString({
        colors: true,
        chunks: false
    }));

    browserSync.reload();
    if (typeof callback === 'function') callback();
}

/*
  Pug
 */
gulp.task('pug', () => {
  gulp.src('src/templates/*.pug')
    .pipe(pug({
      pretty: true
    }).on( "error", notify.onError({
      message: "<%= error.message %>",
      title  : "Pug Error!"
      })))
    .pipe(gulp.dest('build/'))
});

/*
  PostCSS
 */
let postCssPlugins = [
  autoprefixer({browsers: ['last 2 version']}),
  mqpacker({
    sort: function (a, b) {
      return b.localeCompare(a);
    }
  })
];

/*
  LESS
 */
gulp.task('less', function() {
  gulp.src('src/less/style.less')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(gulpIf(isDev, sourcemaps.init()))    
    .pipe(less())
    .pipe(postcss(postCssPlugins))
    .pipe(csscomb())
    .pipe(gulpIf(isDev, sourcemaps.write()))    
    .pipe(gulp.dest('build/css'))
});

/*
  SVG-спрайт(собирает спрайт и кидает в корень img с расширением HTML)
*/
gulp.task('svg:sprite', () => {
  return gulp.src('src/svg-sprite-icons/*.svg') 
    .pipe(plumber({errorHandler: notify.onError("Error SVG: <%= error.message %>")}))   
    .pipe(svgmin(function (file) {
      return {
        plugins: [{
          cleanupIDs: {
            minify: true
          }
        }]
      }
    }))
    .pipe(rename({prefix: 'icon-'}))
    .pipe(svgstore({ inlineSvg: true }))
    .pipe(cheerio({
      run: function ($) {
          $('svg').attr('style', 'display:none;');
        },
          parserOptions: { xmlMode: true }
    }))    
    .pipe(rename('symbol-sprite.html'))
    .pipe(gulp.dest('bulid/img'));
});

/*
  PNG-спрайт(кидает в корень img + less в less/blocks)
 */
gulp.task('png:sprite', () => {
  var spriteData = gulp.src('src/png-sprite-icons/*.png')
  .pipe(spritesmith({
    imgName: '../img/sprite.png',
    cssName: 'sprite.less',
    cssFormat: 'css',
    algorithm: 'top-down',
    padding: 10
  }));
  spriteData.img.pipe(gulp.dest('build/img/'));
  spriteData.css.pipe(gulp.dest('src/less/'));
});

/*
  Browser-sync
 */
gulp.task('bs', () => {
  browserSync.init({
    server: {
      baseDir: 'build'
    },
    notify: false
  });
});

/*
  CSS libs
 */
gulp.task('css-libs', () => {
  return gulp.src('build/css/style.css')
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('build/css'));
});

/*
  Watch
 */
gulp.task('watch', ['dev'], () => {
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/templates/**/*.pug', ['pug']);
  gulp.watch('src/png-sprite-icons/*.png', ['png:sprite']);
  gulp.watch('src/img/*.{png, jpg, jpeg, svg}', ['img']);
  gulp.watch('src/svg-sprite-icons/*.svg', ['svg:sprite']);
  gulp.watch('src/fonts/**/*.*', ['fonts']);
  gulp.watch('build/*.html', browserSync.reload);
  gulp.watch('build/img/**/*.*', browserSync.reload);
  gulp.watch('build/css/*.css', browserSync.reload);
  gulp.watch('build/js/**/*.js', browserSync.reload);
  gulp.watch('build/fonts/**/*.*', browserSync.reload);
});

/*
  Clean
 */
gulp.task('clean', () => {
  return del.sync('build');
});

/*
  Fonts
 */
gulp.task('fonts', () => {
  gulp.src(['src/fonts/**/*', '!src/fonts/**/*.less'])
  .pipe(gulp.dest('build/fonts'))
});

/*
  Image optimaze
 */
gulp.task('img', () => {
  return gulp.src('src/img/**/*.{svg,jpg,jpeg,png}')
    .pipe(gulpIf(!isDev, cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
  }))))
    .pipe(gulp.dest('build/img'));
});

/**
 * Development
 */
gulp.task('dev', () => {
  runSequence(
    'clear',
    'img',
    'fonts',
    'less',
    'css-libs',
    'pug',    
    'webpack:watch',
    'bs'); 
});


/*
  Build task
 */
gulp.task('build', () => {
  runSequence(
    'clean',
    'img',
    'fonts',
    'less',
    'css-libs',
    'pug',
    'webpack'); 
});


/*
  Clear Cache
 */
gulp.task('clear', () => {
  return cache.clearAll();
})

gulp.task('default', ['watch']);

/*
  Smart Grid
 */
gulp.task('smartgrid', () => {
    var settings = {
    outputStyle: 'less',
        columns: 12,
            tab: "  ",
         offset: "30px", 
      container: {maxWidth: '1200px', fields: '30px'},
    breakPoints: {
        lg: {
          'width': '1100px', /* -> @media (max-width: 1100px) */
          'fields': '30px' /* side fields */
        },
        md: {
          'width': '960px',
          'fields': '15px'
        },
        sm: {
          'width': '780px',
          'fields': '15px'
        },
        xs: {
          'width': '560px',
          'fields': '15px'
        }
      }
    };
    smartgrid('./src/less/', settings);
});