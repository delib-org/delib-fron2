function createQuillEditor(elementUid){
    var toolbarOptions = [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['clean']
    ]

    var options = {
      debug: 'info',
      modules: { toolbar: toolbarOptions },
      placeholder: 'הכנס טקסט כאן...',
      readOnly: false,
      theme: 'snow'
    };

    var editor = new Quill(elementUid, options);
}
