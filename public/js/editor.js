function createQuillEditor(elementUid){
    console.log("create quill editor")
    var checkConsole = function(){
        console.log("\n\nclickEvent");
    }

    var toolbarOptions = [
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['clean']
    ];

    var options = {
      modules: {
          toolbar: toolbarOptions
    },
      theme: 'snow',
      readOnly: false
    };

    var editor = new Quill(elementUid, options);
    console.dir(editor)

}

