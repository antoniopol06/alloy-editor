/* global React, AlloyEditor */

(function() {
    'use strict';

    var React = AlloyEditor.React;

    var ButtonaMustHaveTitle = React.createClass(
        {
            mixins: [AlloyEditor.WidgetFocusManager, AlloyEditor.ButtonCfgProps],

            displayName: 'ButtonaMustHaveTitle',

            propTypes: {
                editor: React.PropTypes.object.isRequired
            },

            statics: {
                key: 'aMustHaveTitle'
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
                    violationAccessibility: 'aMustHaveTitle'
                };
            },

            /**
             * Lifecycle. Invoked once before the component is mounted.
             * The return value will be used as the initial value of this.state.
             *
             * @method getInitialState
             */
            getInitialState: function() {
                var link = this.props.editor.get('nativeEditor').getSelection().getRanges()[0].startContainer.$.parentNode;

                return {
                    titleLink: link.getAttribute('title'),
                    element: link
                };
            },

            /**
             * Lifecycle. Renders UI to attach title to an image through input
             *
             * @method render
             * @return {Object} The content which should be rendered.
             */
            render: function() {
                var editor = this.props.editor.get('nativeEditor');

                var renderComponent;

                var nextButton = this.props.step + 1 < this.props.totalSteps ? (<button className='ae-button' onClick={this.props.nextStep}>next</button>) : undefined;

                var previousButton = this.props.step > 0 ? (<button className='ae-button' onClick={this.props.prevStep}>prev</button>) : undefined;

                if (this.state.element.getAttribute('accessibility-warnings').indexOf('aMustHaveTitle') !== -1) {
                    renderComponent = (
                        <div className='ae-container-edit-link'>
                            <div className='ae-container-input xxl'>
                                <input ariaLabel='title' className='ae-input' onChange={this._handleTitleChange} onKeyDown={this._handleKeyDown} placeholder='title' ref='refTitleLink' title='title' value={this.state.titleLink}>
                                </input>
                            </div>
                            <button className='ae-button' onClick={this._updateTitleA}>
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
                    AlloyEditor.ReactDOM.findDOMNode(instance.refs.refTitleLink).focus();
                };

                if (window.requestAnimationFrame) {
                    window.requestAnimationFrame(focusLinkEl);
                }
                else {
                    setTimeout(focusLinkEl, 0);
                }

            },

            /**
             * Event attached to title input that fires when its value is changed
             *
             * @protected
             * @param {MouseEvent} event
             */
            _handleTitleChange: function(event) {
                this.setState({ titleLink: event.target.value });

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
                    this._updateTitleA();
                }
            },

            /**
             * Method called by clicking ok button or pushing key enter to update titleLink state and to update title property from the image that is selected
             * This method calls cancelExclusive to show the previous toolbar before enter to edit title property
             *
             * @protected
             */
            _updateTitleA: function() {
                var editor = this.props.editor.get('nativeEditor');

                var newValue = this.refs.refTitleLink.value;

                this.setState(
                    {
                        titleLink: newValue
                    }
                );

                this.state.element.setAttribute('title', newValue);

                var elementSelected = this.props.elementSelected;

                if (this.state.element.getAttribute('title')) {
                    var violation = this.state.element.getAttribute('accessibility-warnings');

                    violation = violation.replace(this.props.violationAccessibility, '');
                    this.state.element.setAttribute('accessibility-warnings', violation.trim());
                }

                editor.fire('actionPerformed', this);

                this.props.cancelExclusive();

            }
        }
    );

    AlloyEditor.AccessibilityButtons[ButtonaMustHaveTitle.key] = AlloyEditor.ButtonaMustHaveTitle = ButtonaMustHaveTitle;
}());