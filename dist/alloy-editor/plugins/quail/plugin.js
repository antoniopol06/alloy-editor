/*! QUAIL CKEditor plugin | quailjs.org | quailjs.org/license */
;(function($, CKEDITOR) {
var quailCss = "._quail-accessibility-result {  border-radius: 5px;  border-style: dashed;  border-width: 2px;  cursor: pointer !important;}._quail-accessibility-result._quail-severe, ._quail-accessibility-link.severe img, ._quail-accessibility-result._quail-_severe {  border-color: #994141;}._quail-accessibility-result._quail-moderate, ._quail-accessibility-link.moderate img, ._quail-accessibility-result._quail-_moderate {  border-color: #2e71a0;}._quail-accessibility-result._quail-suggestion, ._quail-accessibility-link.suggestion img, ._quail-accessibility-result._quail-_suggestion {  border-color: #36af60;}._quail-accessibility-result img {  padding: 3px;}._quail-accessibility-icon img, ._quail-accessibility-icon-current {  width: 23px;  height: 23px;  margin-right: -23px;  display: inline-block;  cursor: pointer;  z-index: 1000;  position: absolute;  outline: none;  border: none;}._quail-accessibility-icon-current {  margin-right: auto;  margin-left: -23px;}";
CKEDITOR.plugins.add( 'quail', {

  requires: 'dialog',

  icons : 'quail',

  active : false,

  editor : { },

  quailTests : { },

  severity : {
    0 : 'suggestion',
    0.5 : 'moderate',
    1 : 'severe'
  },

  init: function( editor ) {
    if (typeof editor.config.quail === 'undefined' ||
        typeof editor.config.quail.tests === 'undefined') {
      return;
    }
    var that = this;
    that.editor = editor;
    //We have to manually load the dialog skin because
    //the dialog is not in a definition file.
    CKEDITOR.skin.loadPart( 'dialog' );
    $.getJSON(editor.config.quail.path + '/dist/tests.json', function(tests) {
      that.quailTests = quail.lib.TestCollection(tests);
    });

    CKEDITOR.addCss(quailCss);

    editor.addCommand( 'quailFeedbackDialog', new CKEDITOR.dialogCommand( 'quailFeedbackDialog' ));

    editor.addCommand( 'quailCheckContent', {
      exec : function( editor ) {
        if (that.active) {
          that.removeMarkup(editor);
          this.setState( CKEDITOR.TRISTATE_OFF );
          editor.removeListener('change', that.onChangeEvent);
        }
        else {
          that.checkContent(editor);
          this.setState( CKEDITOR.TRISTATE_ON );
          editor.on('change', that.onChangeEvent);
        }
        that.active = !that.active;
      }
    });

    CKEDITOR.on('instanceDestroyed', function(event) {
      that.removeMarkup(event.editor);
    });

    if ( editor.ui.addButton ) {
      editor.ui.addButton( 'Quail', {
        title: 'Check content for accessibility',
        command: 'quailCheckContent',
        icon: this.path + 'img/quail.png'
      });
		}
  },

  onChangeEvent : function(event) {
    var $context = $(event.editor.document.getDocumentElement().$);
    $context.find('._quail-accessibility-icon').each(function() {
      if($(this).next('._quail-accessibility-result').length === 0) {
        $(this).remove();
      }
    });
  },

  removeMarkup : function(editor) {
    var $context = $(editor.document.getDocumentElement().$);
    $context.find('._quail-accessibility-result, ._quail-accessibility-icon').unbind('click');
    $context.find('._quail-accessibility-result').each(function() {
      $(this).removeClass('_quail-accessibility-result')
             .removeClass('_quail-severe')
             .removeClass('_quail-moderate')
             .removeClass('_quail-suggestion');
    });
    $context.find('._quail-accessibility-icon, ._quail-accessibility-icon-current').remove();
  },

  checkContent : function(editor) {
    var that = this;
    var $scope = $(editor.document.getDocumentElement().$);
    var testsToEvaluate = quail.lib.TestCollection();
    $.each(editor.config.quail.tests, function(index, testName) {
      var testDefinition = that.quailTests.find(testName);
      testDefinition = quail.lib.Test(testDefinition.get('name'), testDefinition.attributes);
      testDefinition.set('scope', $scope.get());
      testDefinition.set('complete', false);
      testsToEvaluate.add(testDefinition);
    });
    try {
      testsToEvaluate.run({
        preFilter: function (testName, element) {
          if ($(element).is('._quail-accessibility-icon, ._quail-accessibility-result')) {
            return false;
          }
        },
        caseResolve: function(eventName, thisTest, _case) {
          if (_case.get('status') === 'failed') {
            var testName = thisTest.get('name');

            that.highlightElement($(_case.get('element')), thisTest, that.editor, testName);
          }
        }
      });
    }
    catch (e) {

    }
  },

  highlightElement : function($element, test, editor, testName) {
    if ($element.hasClass('_quail-accessibility-result')) {
      return;
    }

    var severity = this.severity[test.get('testability')];
    var $image = $('<img>')
                   .attr('alt', 'Accessibility error')
                   .attr('src', this.path + 'img/' + severity + '.png');

    $element.addClass('_quail-accessibility-result')
            .addClass('_quail-' + severity);

    $element.each(function (index, element) {
      element.setAttribute('accessibility-warnings', testName);
    });
  }
});

})(jQuery, CKEDITOR);