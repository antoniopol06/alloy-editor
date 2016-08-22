/* global React, AlloyEditor */

(function() {
    'use strict';

    var React = AlloyEditor.React;

    var ButtonimgHasAlt = React.createClass(
        {
            mixins: [AlloyEditor.WidgetFocusManager, AlloyEditor.ButtonCfgProps],

            displayName: 'ButtonimgHasAlt',

            propTypes: {
                editor: React.PropTypes.object.isRequired
            },

            statics: {
                key: 'imgHasAlt'
            },

            /**
             * Lifecycle. Invoked once, only on the client, immediately after the initial rendering occurs.
             *
             * Focuses on the link input to immediately allow editing. This should only happen if the component
             * is rendered in exclusive mode to prevent aggressive focus stealing.
             *
             * @method componentDidMount
             */
            componentDidMount: function() {
                if (this.props.renderExclusive || this.props.manualSelection) {
                    // We need to wait for the next rendering cycle before focusing to avoid undesired
                    // scrolls on the page
                    this._focusAltInput();
                }
            },

            /**
             * Lifecycle. Returns the default values of the properties used in the widget.
             *
             * @method getDefaultProps
             * @return {Object} The default properties.
             */
            getDefaultProps: function() {
                return {
                    circular: true,
                    descendants: '.ae-toolbar-element',
                    keys: {
                        dismiss: [27],
                        dismissNext: [39],
                        dismissPrev: [37],
                        next: [40],
                        prev: [38]
                    },
                    violationAccessibility: 'imgHasAlt'
                };
            },

            /**
             * Lifecycle. Invoked once before the component is mounted.
             * The return value will be used as the initial value of this.state.
             *
             * @method getInitialState
             */
            getInitialState: function() {
                var image = this.props.editor.get('nativeEditor').getSelection().getSelectedElement();

                return {
                    altImage: image.getAttribute('alt'),
                    element: image
                };
            },

            /**
             * Lifecycle. Renders UI to attach alt to an image through input
             *
             * @method render
             * @return {Object} The content which should be rendered.
             */
            render: function() {
                var editor = this.props.editor.get('nativeEditor');

                var renderComponent;

                var nextButton = this.props.step + 1 < this.props.totalSteps ? (<button className='ae-button' onClick={this.props.nextStep}>next</button>) : undefined;

                var previousButton = this.props.step > 0 ? (<button className='ae-button' onClick={this.props.prevStep}>prev</button>) : undefined;

                if (this.state.element.getAttribute('accessibility-warnings').indexOf('imgHasAlt') !== -1) {
                    renderComponent = (
                        <div className='ae-container-edit-link'>
                            <div className='ae-container-input xxl'>
                                <input ariaLabel='Alt' className='ae-input' onChange={this._handleAltChange} onKeyDown={this._handleKeyDown} placeholder='Alt' ref='refAltInput' title='Alt' value={this.state.altImage}>
                                </input>
                            </div>
                            <button className='ae-button' onClick={this._updateAltImage}>
                                <span className='ae-icon-ok'></span>
                            </button>
                            <span>
                                {this.props.step + 1} de {this.props.totalSteps}
                            </span>
                            {previousButton}
                            {nextButton}
                        </div>
                    );
                }

                return renderComponent;
            },

            /**
             * Focuses the user cursor on the widget's input.
             *
             * @protected
             * @method _focusAltInput
             */
            _focusAltInput: function() {
                var instance = this;

                var focusLinkEl = function() {
                    AlloyEditor.ReactDOM.findDOMNode(instance.refs.refAltInput).focus();
                };

                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(focusLinkEl);
                }
                else {
                    setTimeout(focusLinkEl, 0);
                }

            },

            /**
             * Event attached to alt input that fires when its value is changed
             *
             * @protected
             * @param {MouseEvent} event
             */
            _handleAltChange: function(event) {
                this.setState({ altImage: event.target.value });

                this._focusAltInput();
            },

            /**
             * Event attached to al tinput that fires when key is down
             * This method check that enter key is pushed to update the component´s state
             *
             * @protected
             * @param {MouseEvent} event
             */
            _handleKeyDown: function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    this._updateAltImage();
                }
            },

            /**
             * Method called by clicking ok button or pushing key enter to update altImage state and to update alt property from the image that is selected
             * This method calls cancelExclusive to show the previous toolbar before enter to edit alt property
             *
             * @protected
             */
            _updateAltImage: function() {
                var editor = this.props.editor.get('nativeEditor');

                var newValue = this.refs.refAltInput.value;

                this.setState(
                    {
                        altImage: newValue
                    }
                );

                this.state.element.setAttribute('alt', newValue);

                var elementSelected = this.props.elementSelected;

                if (this.state.element.getAttribute('alt')) {
                    var violation = this.state.element.getAttribute('accessibility-warnings');

                    violation = violation.replace(this.props.violationAccessibility, '');
                    this.state.element.setAttribute('accessibility-warnings', violation.trim());
                }

                editor.fire('actionPerformed', this);

                this.props.cancelExclusive();

            }
        }
    );

    AlloyEditor.AccessibilityButtons[ButtonimgHasAlt.key] = AlloyEditor.ButtonimgHasAlt = ButtonimgHasAlt;
}());