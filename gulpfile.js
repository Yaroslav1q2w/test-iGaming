const { src, dest, series, parallel, watch } = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require("browser-sync").create();
const uglify = require("gulp-uglify-es").default;
const del = require("del");
const autoprefixer = require("gulp-autoprefixer");
const cleancss = require("gulp-clean-css");
const imagemin = require("gulp-imagemin");
const fileInclude = require("gulp-file-include");
const prettyHtml = require("gulp-pretty-html");
const svgSprite = require("gulp-svg-sprite");

const paths = {
	src: {
		html: "./src/**/*.html",
		scripts: "./src/scripts/*.js",
		styles: "./src/styles/**/*.scss",
		images: ["./src/images/**/*", "!./src/images/**/*.svg"],
		svg: "./src/images/*.svg",
		fonts: "./src/fonts/**/*",
	},
	dist: {
		html: "./dist/",
		scripts: "./dist/scripts/",
		styles: "./dist/styles/",
		images: "./dist/images/",
		fonts: "./dist/fonts/",
	},
};

const clean = () => del(["dist/**/*"], { force: true });

const scripts = () => {
	return src(paths.src.scripts)
		.pipe(uglify())
		.pipe(dest(paths.dist.scripts))
		.pipe(browserSync.stream());
};

const styles = () => {
	return src(paths.src.styles)
		.pipe(sourcemaps.init())
		.pipe(sass().on("error", sass.logError))
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 10 versions"],
				grid: true,
			})
		)
		.pipe(
			cleancss({
				level: { 1: { specialComments: 0 } },
				format: "beautify",
			})
		)
		.pipe(sourcemaps.write("./"))
		.pipe(dest(paths.dist.styles))
		.pipe(browserSync.stream());
};

const html = () => {
	return src(paths.src.html)
		.pipe(fileInclude())
		.pipe(
			prettyHtml({
				indent_size: 4,
				indent_char: " ",
				unformatted: ["code", "pre", "em", "strong", "span", "i", "b", "br"],
			})
		)
		.pipe(dest(paths.dist.html))
		.pipe(browserSync.stream());
};

const images = () => {
	return src(paths.src.images).pipe(imagemin()).pipe(dest(paths.dist.images));
};

const sprite = () => {
	return src(paths.src.svg)
		.pipe(
			svgSprite({
				mode: {
					symbol: {
						sprite: "../sprite.svg",
						example: true,
					},
				},
			})
		)
		.pipe(dest(paths.dist.images));
};

const fonts = () => {
	return src(paths.src.fonts).pipe(dest(paths.dist.fonts));
};

const server = () => {
	browserSync.init({
		server: {
			baseDir: ["dist"],
		},
		port: 3000,
		open: true,
	});
};

const watcher = () => {
	watch(paths.src.scripts, scripts);
	watch(paths.src.styles, styles);
	watch(paths.src.html, html);
	watch(paths.src.images, images);
};

const build = series(
	clean,
	parallel(scripts, styles, images, html, fonts, sprite)
);
const dev = series(build, parallel(watcher, server));

exports.build = build;
exports.dev = dev;
exports.default = dev;
