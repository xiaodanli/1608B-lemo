var gulp = require('gulp');

var server = require('gulp-webserver');

var sass = require('gulp-sass');

gulp.task('devCss',function(){
	return gulp.src('./src/scss/*.scss')
	.pipe(sass())
	.pipe(gulp.dest('./src/css'))
})

gulp.task('watch',function(){
	return gulp.watch('./src/scss/*.scss',gulp.series('devCss'))
})

gulp.task('server',function(){
	return gulp.src('src')
	.pipe(server({
		port:8989,
		proxies:[
			{source:'/api/users',target:'http://localhost:3000/api/users'},
			{source:'/api/getIcon',target:'http://localhost:3000/api/getIcon'},
			{source:'/api/addClassify',target:'http://localhost:3000/api/addClassify'},
			{source:'/api/allClassify',target:'http://localhost:3000/api/allClassify'},
			{source:'/api/addBill',target:'http://localhost:3000/api/addBill'},
			{source:'/api/getBill',target:'http://localhost:3000/api/getBill'},
			{source:'/api/delBill',target:'http://localhost:3000/api/delBill'}
		]
	}))
})

gulp.task('dev',gulp.series('devCss','server','watch'))