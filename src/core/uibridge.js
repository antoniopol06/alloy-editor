(function() {
    'use strict';

    if (CKEDITOR.plugins.get('uibridge')) {
        return;
    }

    CKEDITOR.plugins.add(
        'uibridge', {
            init: function(editor) {
                editor.ui.addButton = function(buttonName, buttonDefinition){
                	if (!AlloyEditor.Buttons[buttonDefinition.command]) {
					    var button = React.createClass({
					        displayName: buttonName,

					        propTypes: {
					            editor: React.PropTypes.object.isRequired
					        },

					        statics: {
					            key: buttonDefinition.command
					        },

					        render: function() {
					            var cssClass = 'ae-button';

					            return (
					                React.createElement(
					                    'button',
					                    {
					                        className: cssClass,
					                        'data-type': 'button-marquee',
					                        onClick: this._handleClick,
					                        tabIndex: this.props.tabIndex
					                    },
					                    React.createElement(
					                        'span',
					                        {
					                            className: 'ae-icon-separator'
					                        }
					                    )
					                )
					            );
					        },

					        _handleClick: function() {
					        	this.props.editor.get('nativeEditor').execCommand(buttonDefinition.command);
					        }
					    });

						AlloyEditor.Buttons[buttonDefinition.command] = button;
                	}
                }
            }
        }
    );
}());