import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {IronResizableBehavior} from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import '@polymer/polymer/polymer-legacy.js';
import '@polymer/iron-media-query/iron-media-query.js';
import '@polymer/neon-animation/neon-animated-pages.js';
import '@polymer/neon-animation/neon-animatable.js';
import '@polymer/neon-animation/animations/fade-in-animation.js';
import '@polymer/neon-animation/animations/fade-out-animation.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-styles/color.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/shadow.js';
import '@polymer/paper-styles/typography.js';
import './paper-calendar.js';
import './paper-date-picker-dialog-style.js';
import './paper-year-list.js';

const $_documentContainer = document.createElement('template');
$_documentContainer.setAttribute('style', 'display: none;');

$_documentContainer.innerHTML = `
<custom-style>
  <style include="paper-date-picker-dialog-style">
    /* includes dialog style at document-level for backward compatibility */
  </style>
</custom-style>
`;
document.head.appendChild($_documentContainer.content);


/**
 Material Design [Pickers](http://www.google.com/design/spec/components/pickers.html)

 Provides a responsive date picker based on the material design spec.

 ## Examples:

 Default picker:

 <paper-date-picker></paper-date-picker>

 Setting the initial date to April 20, 2015:

 <paper-date-picker date="April 20, 2015"></paper-date-picker>

 You may also specify a minimum and/or maximum date allowed in this picker using
 the same date notation:

 <paper-date-picker min-date="April 1, 2015" max-date="June 30, 2015"></paper-date-picker>

 If you include this element as part of `paper-dialog`, use the class
 `"paper-date-picker-dialog"` on the dialog element in order to give it proper
 styling:

 <paper-dialog id="dialog" class="paper-date-picker-dialog" modal
 on-iron-overlay-closed="dismissDialog">
 <paper-date-picker id="picker" date="[[date]]"></paper-date-picker>
 <div class="buttons">
 <paper-button dialog-dismiss>Cancel</paper-button>
 <paper-button dialog-confirm>OK</paper-button>
 </div>
 </paper-dialog>

 @element paper-date-picker
 @blurb Provides a responsive date picker based on the material design spec.
 @homepage http://bendavis78.github.io/paper-date-picker/
 @demo demo/index.html
 */
class PaperDatePicker extends mixinBehaviors([IronResizableBehavior], PolymerElement) {
  static get template() {
    return html`
    <style include="paper-date-picker-dialog-style">
      :host {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        display: inline-block;
        color: var(--primary-text-color);
        @apply --paper-font-body1;
        @apply --paper-date-picker;
      }

      /** Landscape ******************/
      #datePicker {
        width: 512px;
        height: 248px;
        @apply --layout-horizontal;
      }

      /** Narrow *********************/
      :host([narrow]) #datePicker {
        width: 328px;
        height: 428px;
        @apply --layout-vertical;
      }
      :host([narrow]) #heading {
        width: auto;
        height: 96px;
        padding: 16px 24px;
        @apply --paper-date-picker-heading--narrow;
      }

      /** Heading ********************/
      #heading {
        width: 168px;
        padding: 16px;
        box-sizing: border-box;
        color: var(--text-primary-color);
        background: var(--default-primary-color);

        @apply --layout-vertical;
        @apply --paper-date-picker-heading;
      }
      #heading .date,
      #heading .year {
        cursor: pointer;
      }
      #heading .date {
        @apply --paper-font-display1;
        font-weight: bold;
        margin-top: 2px;
        @apply --paper-date-picker-heading-date;
      }
      #heading div.date {
        letter-spacing: 0.025em;
      }
      #heading .date span {
        white-space: nowrap;
      }
      #heading .year {
        @apply --paper-font-body2;
        font-size: var(--paper-date-picker-year-size, 16px);
        @apply --paper-date-picker-heading-date;
      }
      #heading:not(.pg-chooseYear) .year,
      #heading.pg-chooseYear .date {
        color: var(--light-primary-color);
      }

      /** Calendar/Year picker ********/
      :host([isTouch]) paper-year-list::-webkit-scrollbar {
        width: 0 !important;
      }
      #pages {
        @apply --layout-flex;
        width: auto;
        background: var(--default-background-color);
      }
      #calendar {
        --paper-calendar: {
          @apply --paper-date-picker-calendar;
        }
      }
    </style>
    <style is="custom-style" include="paper-date-picker-dialog-style">
    </style>
    <iron-media-query query="{{_getMediaQuery(forceNarrow, responsiveWidth)}}" query-matches="{{_queryMatches}}"></iron-media-query>
    <div id="datePicker">
      <div id="heading" class\$="{{_getHeadingClass('heading-content', _selectedPage)}}">
        <div class="year" on-tap="_tapHeadingYear">{{dateFormat(date, 'YYYY', locale)}}</div>
        <div class="date" on-tap="_tapHeadingDate">
          <template is="dom-repeat" items="{{_splitHeadingDate(date, headingFormat, locale)}}">
            <span>{{item}}</span>
          </template>
        </div>
      </div>
      <neon-animated-pages id="pages" selected="{{_selectedPage}}" attr-for-selected="id" entry-animation="fade-in-animation" exit-animation="fade-out-animation" on-iron-select="_pageSelected">
        <neon-animatable id="chooseDate">
          <paper-calendar id="calendar" locale="{{locale}}" date="{{date}}" min-date="{{minDate}}" max-date="{{maxDate}}">
          </paper-calendar>
        </neon-animatable>
        <neon-animatable id="chooseYear">
          <paper-year-list id="yearList" date="{{date}}" on-tap="_tapHeadingDate" min="[[_minYear]]" max="[[_maxYear]]"></paper-year-list>
        </neon-animatable>
      </neon-animated-pages>
    </div>
`;
  }

  static get is() {
    return 'paper-date-picker';
  }

  static get properties() {
    return {
      /**
       * The selected date (YYYY-MM-DD)
       */
      date: {
        type: Date,
        notify: true
      },
      /**
       * Maximum screen width at which the picker uses a vertical layout
       */
      responsiveWidth: {
        type: String,
        value: '560px'
      },
      /**
       * The current locale
       */
      locale: {
        type: String,
        value: 'en'
      },
      /**
       * The format of the date displayed in the heading.
       * See docuemntation for Moment.js for more info.
       */
      headingFormat: {
        type: String,
        value: 'ddd, MMM D'
      },
      /**
       * The minimum allowed date
       */
      minDate: {
        type: Date,
        value: null
      },
      /**
       * The maximum allowed date
       */
      maxDate: {
        type: Date,
        value: null
      },
      /**
       * Force narrow layout
       */
      forceNarrow: {
        type: Boolean,
        value: false
      },
      narrow: {
        type: Boolean,
        reflectToAttribute: true,
        notify: true,
        computed: '_computeNarrow(forceNarrow, _queryMatches)'
      },
      isTouch: {
        type: Boolean,
        value: false,
        readOnly: true,
        reflectToAttribute: true
      },
      _queryMatches: {
        type: Boolean,
        value: false
      },
      headingBreak: {
        type: String,
        value: '[,]'
      },
      _selectedPage: String,
      _maxYear: {
        type: Number,
        computed: '_getFullYear(maxDate)'
      },
      _minYear: {
        type: Number,
        computed: '_getFullYear(minDate)'
      }
    };
  }

  ready() {
    super.ready();
    this._resizeHandler = this._resizeHandler.bind(this);
    this.today = this.$.calendar.today;
    this._setIsTouch('ontouchstart' in window);
    this._selectPage('chooseDate');
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('iron-resize', this._resizeHandler);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('iron-resize', this._resizeHandler);
  }

  dateFormat() {
    return this.$.calendar.dateFormat.apply(this.$.calendar, arguments);
  }

  _tapHeadingDate() {
    if (this.$.pages.selected !== 'chooseDate') {
      this._selectPage('chooseDate');
    } else {
      // tapping the date header while already viewing months brings you back
      // to the selected month
      this.$.calendar.currentMonth = this.date.getMonth() + 1;
      this.$.calendar.currentYear = this.date.getFullYear();
    }
  }

  _tapHeadingYear() {
    if (this.$.pages.selected !== 'chooseYear') {
      this._selectPage('chooseYear');
      this.$.yearList.centerSelected();
    }
  }

  _selectPage(page) {
    this.$.pages.selected = page;
  }

  _getMediaQuery(forceNarrow, responsiveWidth) {
    return '(max-width: ' + (forceNarrow ? '' : responsiveWidth) + ')';
  }

  _getHeadingClass(pfx, selectedPage) {
    return pfx + ' pg-' + selectedPage;
  }

  _getFullYear(date) {
    return date ? new Date(date).getFullYear() : null;
  }

  _splitHeadingDate(date, format, locale) {
    var re = new RegExp(this.headingBreak, 'g');
    var text = this.dateFormat(date, format, locale);
    var seps = text.match(re);
    var value;
    if (!seps) {
      value = [text];
    } else {
      value = text.split(re).map(function (s, i) {
        return s + (seps[i] || '');
      });
    }
    return value;
  }

  _computeNarrow(queryMatches, forceNarrow) {
    return queryMatches || forceNarrow;
  }

  _pageSelected() {
    this._resizeHandler();
  }

  _resizeHandler() {
    if (this._resizing) {
      return;
    }
    this._resizing = true;
    this.$.calendar.notifyResize();
    this._resizing = false;

    this.updateStyles();
  }
}

window.customElements.define(PaperDatePicker.is, PaperDatePicker);
