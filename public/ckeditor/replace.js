window.onload = function() { 

  CKEDITOR.replace('editor1', { 
      uiColor : '#9AB8F3',
      fullPage: true,
      language: 'zh-cn',
      height: 830,
      width: 680,
      portrait: true,
      toolbar :
        [
            ['Print','-','Preview']
        ]
  });

}


