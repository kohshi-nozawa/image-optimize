const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const changed = require("gulp-changed");
const webp = require("gulp-webp"); // WebP変換用プラグイン

// 画像圧縮タスク
function image_optimize() {
  return gulp.src('./srcImg/**/*.{png,jpg,jpeg,JPG,JPEG,PNG}')
    .pipe(changed("distImg"))
    .pipe(
      imagemin([
        pngquant({
          quality: [0.7, 0.85], // 画質
          speed: 1 // スピード
        }),
        mozjpeg({
          quality: 85, // 画質
          progressive: true
        })
      ])
    )
    .pipe(gulp.dest("./distImg/"));
}

// WebP変換タスク
function convert_to_webp() {
  return gulp.src('./srcWebp/**/*.{png,jpg,jpeg,JPG,JPEG,PNG}')
    .pipe(changed("distWebp"))
    .pipe(webp({
      quality: 85 // WebP画質設定
    }))
    .pipe(gulp.dest("./distWebp/"));
}

// デフォルトタスク
gulp.task('default', gulp.series(image_optimize, convert_to_webp, function(done) {
  console.log('Image optimization and WebP conversion are complete');
  done();
}));

// Watchタスク
gulp.task('watch', function () {
  gulp.watch('./srcImg/**/*.{png,jpg,jpeg,JPG,JPEG,PNG}', gulp.series(image_optimize, function (done) {
    console.log('Image optimization is complete');
    done();
  }));
  gulp.watch('./srcWebp/**/*.{png,jpg,jpeg,JPG,JPEG,PNG}', gulp.series(convert_to_webp, function (done) {
    console.log('WebP conversion is complete');
    done();
  }));
});
