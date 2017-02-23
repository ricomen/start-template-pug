var gulp           = require('gulp');              // Подключаем Gulp
var less           = require('gulp-less');         // Подключаем Less пакет,
var browserSync    = require('browser-sync');      // Подключаем Browser Sync
var concat         = require('gulp-concat');       // Подключаем gulp-concat (для конкатенации файлов)
var uglify         = require('gulp-uglifyjs');     // Подключаем gulp-uglifyjs (для сжатия JS)
var cssnano        = require('gulp-cssnano');      // Подключаем пакет для минификации CSS
var rename         = require('gulp-rename');       // Подключаем библиотеку для переименования файлов
var del            = require('del');               // Подключаем библиотеку для удаления файлов и папок
var imagemin       = require('gulp-imagemin');     // Подключаем библиотеку для работы с изображениями
var pngquant       = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
var cache          = require('gulp-cache');        // Подключаем библиотеку кеширования
var autoprefixer   = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
var plumber        = require('gulp-plumber');      // Выводим ошибки не останавливая поток
var csscomb        = require('gulp-csscomb');      // Причесываем CSS
var spritesmith    = require('gulp.spritesmith');  // Собираем спрайт 
var svgstore       = require('gulp-svgstore');     // Сборщик спрайта
var svgmin         = require('gulp-svgmin');       // Минифицируем SVG
var cheerio        = require('gulp-cheerio');      // Добавление атрибутоп...
var replace        = require('gulp-replace');
var smartgrid      = require('smart-grid');        // Сетка Smart-grid
var pug            = require('gulp-pug2');         // Шаблонизатор PUG
var eslint         = require('gulp-eslint');       // ES-Linter
var notify         = require('gulp-notify');       // Вывод уведомлений
/*var emitty       = require('emitty').setup('src/pug', 'pug', {
  makeVinylFile: true
});*/

//ES-Linter
gulp.task('lint', function () {
  return gulp.src(['src/js/main.js','!node_modules/**'])
  .pipe(eslint({
    rules: {
      'no-alert': 0,
      'no-bitwise': 0,
      'camelcase': 1,
      'curly': 1,
      'eqeqeq': 0,
      'no-eq-null': 0,
      'guard-for-in': 1,
      'no-empty': 1,
      'no-use-before-define': 0,
      'no-obj-calls': 2,
      'no-unused-vars': 0,
      'new-cap': 1,
      'no-shadow': 0,
      'strict': 2,
      'no-invalid-regexp': 2,
      'comma-dangle': 2,
      'no-undef': 1,
      'no-new': 1,
      'no-extra-semi': 1,
      'no-debugger': 2,
      'no-caller': 1,
      'semi': 1,
      'quotes': 0,
      'no-unreachable': 2
    },
    globals: ['$'],
    envs: ['node']
    }))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
});

//SVG-спрайт(собирает спрайт и кидает в корень img с расширением HTML)
gulp.task('svgSprite', function () {
  return gulp.src('src/img/svg/*.svg')    
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
    .pipe(gulp.dest('src/img/'));
});

//Шаблонизатор
gulp.task('pug', function() {
  return gulp.src('src/pug/*.pug')
    .pipe(pug({}).on( "error", notify.onError({
      message: "<%= error.message %>",
      title  : "Pug Error!"
      })))
    .pipe(gulp.dest('src/'))
});

//LESS-препроцессор
gulp.task('less', function() {
  gulp.src('src/less/style.less')
    .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
    .pipe(less())
    .pipe(autoprefixer(['last 4 versions'], { cascade: true }))
    .pipe(csscomb())
    .pipe(gulp.dest('src/css'))
    
});

//PNG-спрайт(кидает в корень img + css в less/blocks)
gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/icons/*.png')
  .pipe(spritesmith({
    imgName: '../img/sprite.png',
    cssName: 'sprite.css',
    cssFormat: 'css',
    algorithm: 'top-down',
    padding: 10
  }));
  spriteData.img.pipe(gulp.dest('src/img/'));
  spriteData.css.pipe(gulp.dest('src/less/'));
});

//Browser-sync
gulp.task('browser-sync', function() {
  browserSync({
      server: {
          baseDir: 'src'
      },
      notify: false
  });
});

//Собираем, углифицирцем скрипты
gulp.task('scripts', function() {
  return gulp.src([
    'src/js/libs/jquery/dist/jquery.min.js',
    'src/js/libs/magnific-popup/dist/jquery.magnific-popup.min.js',
    'node_modules/html5shiv/disthtml5shiv.min.js',
    'node_modules/es5-shim/es5-sham.min.js'
    ])
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('src/js'));
});

//Минимизируем css, добавляем префикс min
gulp.task('css-libs', ['less'], function() {
  return gulp.src('src/css/style.css')
      .pipe(cssnano())
      .pipe(rename({suffix: '.min'}))
      .pipe(gulp.dest('src/css'));
});

//Основной таск
gulp.task('watch', ['browser-sync', 'lint'], function() {
  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('src/pug/**/*.pug', ['pug']);
  gulp.watch('src/js/main.js', ['lint']);
  gulp.watch('src/*.html', browserSync.reload);
  gulp.watch('src/css/*.css', browserSync.reload);
  gulp.watch('src/js/**/*.js', browserSync.reload);
});

//Удаляние папки build перед выгрузкой
gulp.task('clean', function() {
  return del.sync('build');
});

//Оптимиация изображений
gulp.task('img', function() {
  return gulp.src('src/img/*.*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: [pngquant()]
  })))
    .pipe(gulp.dest('build/img'));
});

//Выгружаем проект в build
gulp.task('build', ['clean', 'img', 'less', 'scripts'], function() {

  var buildCss = gulp.src([ 
      'src/css/*.css',
      ])
  .pipe(gulp.dest('build/css'))

  var buildFonts = gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('build/fonts'))

  var buildJs = gulp.src('src/js/**/*')
  .pipe(gulp.dest('build/js'))

  var buildHtml = gulp.src('src/*.html')
  .pipe(gulp.dest('build'));

});

//Читка кэша
gulp.task('clear', function () {
  return cache.clearAll();
})

gulp.task('default', ['watch']);

//Генератор  примесей для адаптивной сетки(Flex)
gulp.task('smartgrid', function () {
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
    smartgrid('./src/less/global', settings);
});



