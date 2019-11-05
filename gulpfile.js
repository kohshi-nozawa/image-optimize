const gulp     = require('gulp');
const imagemin = require('gulp-imagemin');
const mozjpeg = require("imagemin-mozjpeg");
const pngquant = require("imagemin-pngquant");
const changed = require("gulp-changed");

function image_optimize() {
  return gulp.src('./srcImg/**/*.{png,jpg}')
  .pipe(changed("distImg"))
  .pipe(
    imagemin([
      pngquant({
        quality: "70-85", // 画質
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

exports.image_optimize = image_optimize;

gulp.task('default', gulp.series(image_optimize,function(done) {
  console.log('Image optimization is complete');
  done();
}));