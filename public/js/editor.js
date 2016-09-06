function createQuillEditor(elementUid){

    var toolbarOptions = [
      [{ 'align': [] }],
      [{ 'direction': 'rtl' }],
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['clean']
    ];

    var options = {
      debug: 'info',
      modules: { toolbar: toolbarOptions },
      placeholder: 'enter text here...',
      theme: 'snow',
      readOnly: false,
    };

    var editor = new Quill(elementUid, options);
}
