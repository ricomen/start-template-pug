var gulp         = require('gulp');              // Подключаем Gulp
var less         = require('gulp-less');         // Подключаем Less пакет,
var browserSync  = require('browser-sync');      // Подключаем Browser Sync
var concat       = require('gulp-concat');       // Подключаем gulp-concat (для конкатенации файлов)
var uglify       = require('gulp-uglifyjs');     // Подключаем gulp-uglifyjs (для сжатия JS)
var cssnano      = require('gulp-cssnano');      // Подключаем пакет для минификации CSS
var rename       = require('gulp-rename');       // Подключаем библиотеку для переименования файлов
var del          = require('del');               // Подключаем библиотеку для удаления файлов и папок
var imagemin     = require('gulp-imagemin');     // Подключаем библиотеку для работы с изображениями
var pngquant     = require('imagemin-pngquant'); // Подключаем библиотеку для работы с png
var cache        = require('gulp-cache');        // Подключаем библиотеку кеширования
var autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов
var plumber      = require('gulp-plumber');      // Слушаем ошибки
var csscomb      = require('gulp-csscomb');      // Причесываем CSS
var spritesmith  = require('gulp.spritesmith');  // Собираем спрайт 
var smartgrid    = require('smart-grid');        // Сетка Smart-grid
var pug          = require('gulp-pug2');
var pugLinter    = require('gulp-pug-linter');
/*var emitty       = require('emitty').setup('src/pug', 'pug', {
  makeVinylFile: true
});*/

gulp.task('pug', ['pugLinter'], function() {
    return gulp.src('src/pug/*.pug')       
        .pipe(pug({}))
        .pipe(gulp.dest('src/'))
});

gulp.task('pugLinter', function () {
  return gulp.src('src/**/*.pug')
    .pipe(pugLinter())
    .pipe(pugLinter.reporter('fail'))
});


gulp.task('less', function() {                  // Создаем таск Less
    gulp.src('src/less/style.less')             // Берем источник
        .pipe(plumber())                        //Слушаем ошибки
        .pipe(less())                           // Преобразуем less в CSS посредством gulp-less
        .pipe(autoprefixer(['last 4 versions'], { cascade: true })) // Создаем префиксы
        .pipe(csscomb())                        // Причесываем CSS
        .pipe(gulp.dest('src/css')) // Выгружаем результат в папку src/css
        .pipe(browserSync.reload({stream: true})) // Обновляем CSS на странице при изменении
});

gulp.task('sprite', function () {
  var spriteData = gulp.src('src/img/icons/*.png')
  .pipe(spritesmith({
    imgName: '../img/sprite.png',      //Имя спрайта
    cssName: 'sprite.css',     // Имя  файла стилей
    cssFormat: 'css',          // Указал формат
    algorithm: 'top-down',      // Направление сверху вниз
    padding: 10                 // Отступ от картинки
  }));
  spriteData.img.pipe(gulp.dest('src/img/')); //Путь к спрайту
  spriteData.css.pipe(gulp.dest('src/less/')); //Путь к Less
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({                      // Выполняем browserSync
        server: {                      // Определяем параметры сервера
            baseDir: 'src'             // Директория для сервера - src
        },
        notify: false                  // Отключаем уведомления
    });
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
        'src/js/libs/jquery/dist/jquery.min.js', // Берем jQuery
        'src/js/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('src/js')); // Выгружаем в папку src/js
});

gulp.task('css-libs', ['less'], function() {
    return gulp.src('src/css/style.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('src/css')); // Выгружаем в папку src/css
});

gulp.task('watch', ['browser-sync', 'css-libs', 'scripts'], function() {  
    gulp.watch('src/less/**/*.less', ['less']); // Наблюдение за less файлами в папке less
    gulp.watch('src/pug/**/*.pug', ['pug']); // Наблюдение за pug файлами в папке slm
    gulp.watch('src/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('src/css/*.css', browserSync.reload);
    gulp.watch('src/js/**/*.js', browserSync.reload);   // Наблюдение за JS файлами в папке js
});

gulp.task('clean', function() {
    return del.sync('build'); // Удаляем папку build перед сборкой
});

gulp.task('img', function() {
    return gulp.src('src/img/*.*') // Берем все изображения из src/img
        .pipe(cache(imagemin({  // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('build/img')); // Выгружаем на продакшен
});

gulp.task('build', ['clean', 'img', 'less', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
        'src/css/*.css',
        ])
    .pipe(gulp.dest('build/css'))

    var buildFonts = gulp.src('src/fonts/**/*') // Переносим шрифты в продакшен
    .pipe(gulp.dest('build/fonts'))

    var buildJs = gulp.src('src/js/**/*') // Переносим скрипты в продакшен
    .pipe(gulp.dest('build/js'))

    var buildHtml = gulp.src('src/*.html') // Переносим HTML в продакшен
    .pipe(gulp.dest('build'));

});

gulp.task('clear', function () {
    return cache.clearAll();
})

gulp.task('default', ['watch']);


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



