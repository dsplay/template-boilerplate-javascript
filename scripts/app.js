"use strict";

(function () {

    // here we can apply the dsplay-data.js values to your template

    // we have access to dsplay objects: dsplay_config, dsplay_media and dsplay_template
    document.querySelector('.title').innerHTML = dsplay_template.title;

    var opacity = parseFloat(dsplay_template.text_opacity);
    var text = document.querySelector('.text');
    text.innerHTML = dsplay_media.name;
    text.style.opacity = opacity;

    document.querySelector('img').src = dsplay_template.image;

    // dsplayTemplateUtils can make our lives easier
    // use the method tval to get string values with a optional default value
    // the methods tbval, tival, tfval are useful for non-string values (boolean, integer, float)
    var u = dsplayTemplateUtils;

    var fontSize = u.tval('base_font_size', '1.5em');
    document.body.style.fontSize = fontSize;

    var titleOpacity = u.tfval('title_opacity', 1);
    document.querySelector('.title').style.opacity = titleOpacity;

    document.querySelector('#root').style.opacity = 1;
})();