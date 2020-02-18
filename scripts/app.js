(function () {

    document.querySelector('.title').innerHTML = dsplay_template.title;

    var opacity = parseFloat(dsplay_template.text_opacity);
    var text = document.querySelector('.text');
    text.innerHTML = dsplay_media.name;
    text.style.opacity = opacity;

    document.querySelector('img').src = dsplay_template.image;

})();