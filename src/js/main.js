/**
 * miniPaint - https://github.com/viliusle/miniPaint
 * author: Vilius L.
 */

//css
import './../css/reset.css';
import './../css/utility.css';
import './../css/component.css';
import './../css/layout.css';
import './../css/menu.css';
import './../css/print.css';
import './../css/font.css';
import './../../node_modules/alertifyjs/build/css/alertify.min.css';
import './../fonts/ZCOOL.ttf'
import './../fonts/ZCOOLKuaiLe.ttf'
import './../fonts/LiuJianMaoCao.ttf'
import './../fonts/LongCang.ttf'
import './../fonts/MaShanZheng.ttf'
import './../fonts/ZhiMangXing.ttf'
//js
import app from './app.js';
import config from './config.js';
import './core/components/index.js';
import Base_gui_class from './core/base-gui.js';
import Base_layers_class from './core/base-layers.js';
import Base_tools_class from './core/base-tools.js';
import Base_state_class from './core/base-state.js';
import Base_search_class from './core/base-search.js';
import File_open_class from './modules/file/open.js';
import File_save_class from './modules/file/save.js';
import * as Actions from './actions/index.js';




const loadFont = (fontName) => {
	const myFont = new FontFace(fontName, `url(./dist/fonts/${fontName}.ttf)`)
	return new Promise((resolve) => {
		myFont.load().then(font => {
			document.fonts.add(font)
			resolve()
		}).catch((err) => {
			console.log(err)
			resolve()
		})
	})
}

const initApp = () => {
	// Initiate app
	var Layers = new Base_layers_class();
	var Base_tools = new Base_tools_class(true);
	var GUI = new Base_gui_class();
	var Base_state = new Base_state_class();
	var File_open = new File_open_class();
	var File_save = new File_save_class();
	var Base_search = new Base_search_class();

	// Register singletons in app module
	app.Actions = Actions;
	app.Config = config;
	app.FileOpen = File_open;
	app.FileSave = File_save;
	app.GUI = GUI;
	app.Layers = Layers;
	app.State = Base_state;
	app.Tools = Base_tools;

	// Register as global for quick or external access
	window.Layers = Layers;
	window.AppConfig = config;
	window.State = Base_state;
	window.FileOpen = File_open;
	window.FileSave = File_save;

	// Render all
	GUI.init();
	Layers.init();
}

window.addEventListener('load', function (e) {
	Promise.all([
		loadFont('ZCOOL'),
		loadFont('ZCOOLKuaiLe'),
		loadFont('LiuJianMaoCao'),
		loadFont('LongCang'),
		loadFont('MaShanZheng'),
		loadFont('ZhiMangXing'),
	]).then(() => {
		initApp()
	})
}, false)
