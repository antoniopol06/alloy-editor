(function () {
    'use strict';

    /**
     * The ButtonAccessible class provides functionality for creating and editing a link in a document. ButtonAccessible
     * renders in two different modes:
     *
     * - Normal: Just a button that allows to switch to the edition mode
     * - Exclusive: The ButtonLinkEdit UI with all the link edition controls.
     *
     * @uses ButtonKeystroke
     * @uses ButtonStateClasses
     * @uses ButtonCfgProps
     *
     * @class ButtonAccessible
     */
    var ButtonAccessible = React.createClass({
        mixins: [AlloyEditor.ButtonKeystroke, AlloyEditor.ButtonStateClasses, AlloyEditor.ButtonCfgProps],

        // Allows validating props being passed to the component.
        propTypes: {
            /**
             * The editor instance where the component is being used.
             *
             * @property {Object} editor
             */
            editor: React.PropTypes.object.isRequired,

            /**
             * The label that should be used for accessibility purposes.
             *
             * @property {String} label
             */
            label: React.PropTypes.string,

            /**
             * The tabIndex of the button in its toolbar current state. A value other than -1
             * means that the button has focus and is the active element.
             *
             * @property {Number} tabIndex
             */
            tabIndex: React.PropTypes.number
        },

        // Lifecycle. Provides static properties to the widget.
        statics: {
            /**
             * The name which will be used as an alias of the button in the configuration.
             *
             * @static
             * @property {String} key
             * @default link
             */
            key: 'accessibility'
        },

        getInitialState() {
            return {
                step: 0
            };
        },

        /**
         * Lifecycle. Returns the default values of the properties used in the widget.
         *
         * @method getDefaultProps
         * @return {Object} The default properties.
         */
        getDefaultProps: function() {
            return {
                keystroke: {
                    fn: '_requestExclusive',
                    keys: CKEDITOR.CTRL + 76 /*L*/
                }
            };
        },

        /**
         * Checks if the current selection is contained within a link.
         *
         * @method isActive
         * @return {Boolean} True if the selection is inside a link, false otherwise.
         */
        isActive: function() {
            return (new CKEDITOR.Link(this.props.editor.get('nativeEditor')).getFromSelection() !== null);
        },

        /**
         * Lifecycle. Renders the UI of the button.
         *
         * @method render
         * @return {Object} The content which should be rendered.
         */
        render: function() {
            var cssClass = 'ae-button ' + this.getStateClasses();

            var element = this.props.editor.get('nativeEditor').getSelection().getSelectedElement() || this.props.editor.get('nativeEditor').getSelection().getRanges()[0].startContainer.$.parentNode;

            var cssStyle;

            var buttons;

            var accessibilityWarnings;

            if (element && element.getAttribute) {
                accessibilityWarnings = element.getAttribute('accessibility-warnings');
            }

            if (accessibilityWarnings === '' || !accessibilityWarnings) {
                cssStyle = {
                    color: 'green'
                };
            }
            else {
                cssStyle = {
                    color: 'red'
                };

                buttons = accessibilityWarnings.split(' ');
            }

            if (this.props.renderExclusive && buttons[this.state.step]) {
                var props = this.mergeButtonCfgProps();

                var ButtonAccessibility = AlloyEditor['Button' + buttons[this.state.step]];

                var nextFn = this._goToStep.bind(this, this.state.step + 1);

                var prevFn = this._goToStep.bind(this, this.state.step - 1);

                return (
                    <ButtonAccessibility {...props} step={this.state.step} nextStep={nextFn} prevStep={prevFn} totalSteps={buttons.length}/>
                );
            } else {
                return (
                    <button aria-label={AlloyEditor.Strings.link} style={cssStyle} className={cssClass} data-type="button-link" onClick={this._requestExclusive} tabIndex={this.props.tabIndex} title={AlloyEditor.Strings.link}>
                        <span className="ae-icon-link"></span>
                    </button>
                );
            }
        },

        /**
         * Requests the link button to be rendered in exclusive mode to allow the creation of a link.
         *
         * @protected
         * @method _requestExclusive
         */
        _requestExclusive: function() {
            this.props.requestExclusive(ButtonAccessible.key);
        },

        _goToStep: function(step) {
            this.setState({
                step: step
            });
        }
    });

    AlloyEditor.Buttons[ButtonAccessible.key] = AlloyEditor.ButtonAccessible = ButtonAccessible;
}());