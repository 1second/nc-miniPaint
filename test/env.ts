import jQuery from "jquery";
import { CanvasRenderingContext2D } from "canvas";
Object.defineProperty(global, "CanvasRenderingContext2D", {
  get() {
    return CanvasRenderingContext2D;
  },
});
import { JSDOM } from "jsdom";
const dom = new JSDOM(
  `<!DOCTYPE html><body>
<div class="wrapper">

    <nav aria-label="Main Menu" class="main_menu" id="main_menu"></nav>
    
    <div class="submenu">
        <a class="logo" href="#">miniPaint</a>
        <div class="block attributes" id="action_attributes"></div>
        <button class="undo_button" id="undo_button" type="button">
            <span class="sr_only">Undo</span>
        </button>
    </div>
    
    <div class="sidebar_left" id="tools_container"></div>


    <div class="middle_area" id="middle_area">

        <canvas class="ruler_left" id="ruler_left"></canvas>
        <canvas class="ruler_top" id="ruler_top"></canvas>

        <div class="main_wrapper" id="main_wrapper">
            <div class="canvas_wrapper" id="canvas_wrapper">
                <div id="mouse"></div>
                <div class="transparent-grid" id="canvas_minipaint_background"></div>
                <canvas id="canvas_minipaint">
                    <div class="trn error">
                        Your browser does not support canvas or JavaScript is not enabled.
                    </div>
                </canvas>
            </div>
        </div>
    </div>

    <div class="sidebar_right">
        <div class="preview block">
            <h2 class="trn toggle" data-target="toggle_preview">Preview</h2>
            <div id="toggle_preview"></div>
        </div>
        
        <div class="colors block">
            <h2 class="trn toggle" data-target="toggle_colors">Colors</h2>
            <div class="content" id="toggle_colors"></div>
        </div>
        
        <div class="block" id="info_base">
            <h2 class="trn toggle toggle-full" data-target="toggle_info">Information</h2>
            <div class="content" id="toggle_info"></div>
        </div>
        
        <div class="details block" id="details_base">
            <h2 class="trn toggle toggle-full" data-target="toggle_details">Layer details</h2>
            <div class="content" id="toggle_details"></div>
        </div>
        
        <div class="layers block">
            <h2 class="trn">Layers</h2>
            <div class="content" id="layers_base"></div>
        </div>
    </div>
</div>
<div class="mobile_menu">
    <button class="left_mobile_menu" id="left_mobile_menu_button" type="button">
        <span class="sr_only">Toggle Menu</span>
    </button>
    <button class="right_mobile_menu" id="mobile_menu_button" type="button">
        <span class="sr_only">Toggle Menu</span>
    </button>
</div>
<div class="hidden" id="tmp"></div>
<div id="popups"></div>
<canvas id="canvas_preview"></canvas>
<div id="layers"></div>
</body>`,
  {
    url: "https://www.tiktok.com/",
    resources: "usable",
  }
);

export const window = dom.window;
export const document = dom.window.document;
export const navigator = dom.window.navigator;
export const HTMLAnchorElement = dom.window.HTMLAnchorElement;
export const MutationObserver = dom.window.MutationObserver;
export const location = dom.window.location;
export const Image = dom.window.Image;
export const requestAnimationFrame = () => void 0;

window.$ = jQuery(window);
global.$ = window.$;
global.jQuery = window.$;
window.jQuery = window.$;
// export const jQuery = { fn: {} };
window.CanvasRenderingContext2D = CanvasRenderingContext2D;
window.URL.createObjectURL = () => "";
Object.assign(global, {
  window,
  document,
  navigator,
  HTMLAnchorElement,
  MutationObserver,
  location,
  Image,
  requestAnimationFrame,
});
// global.require.context = () => void 0;
