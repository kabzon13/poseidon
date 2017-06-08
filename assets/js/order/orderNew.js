$(function (win) {
    win.poseidon = win.poseidon || {};

    win.poseidon.OrderNew = {

        _CUSTOMER_SEARCH_URL: '/customer/search',

        init: function () {
            this._initDatePicker();

            this._citySelect = $('.order-new [name=city]');
            this._districtInput = $('.order-new [name=district]');
            this._phonesInput = $('.order-new [name=phones]');
            this._nameInput = $('.order-new [name=name]');
            this._addressInput = $('.order-new [name=address]');

            this._phonesInput.on('keyup  change', this._onPhonesChange.bind(this));
            this._addressInput.on('keyup change', this._onAddressChange.bind(this));
            this._nameInput.on('keyup  change', this._onNameChange.bind(this));

            this._citySelect.on('change', this._onCitySelect.bind(this));

            this._districtInput.autocomplete({
                lookup: this._districtInput.data('districts'),
                onSelect: this._searchOrders.bind(this),
                triggerSelectOnValidInput: false
            });

            this._phonesInput.autocomplete({
                lookup: [],
                onSelect: this._onAutocompleteSelect.bind(this, 'phones'),
                triggerSelectOnValidInput: false
            });

            this._addressInput.autocomplete({
                lookup: [],
                onSelect: this._onAutocompleteSelect.bind(this, 'address'),
                triggerSelectOnValidInput: false
            });

            this._nameInput.autocomplete({
                lookup: [],
                onSelect: this._onAutocompleteSelect.bind(this, 'name'),
                triggerSelectOnValidInput: false
            });
        },

        _onCitySelect: function () {
            this._phonesInput.val('');
            this._addressInput.val('');
            this._districtInput.val('');
            this._nameInput.val('');

            this._searchOrders();
        },

        _onAutocompleteSelect: function (skipField, event) {
            var fieldNames = ['phones', 'name', 'address', 'district'],
                nameToInputMap = {
                    phones: this._phonesInput,
                    name: this._nameInput,
                    address: this._addressInput,
                    district: this._districtInput
                },
                customerInfo = this._customers[event.data] || {};

            //customerInfo.district && this._districtInput.val(customerInfo.district);

            fieldNames.forEach(function (name) {
                if (name === skipField) {
                    return;
                }
                var value = customerInfo[name];

                if (value) {
                    if (Array.isArray(value)) {
                        value.length === 1 && nameToInputMap[name].val(value)
                    } else {
                        nameToInputMap[name].val(value)
                    }
                }
            });

            /*if (customerInfo.address && customerInfo.address.length === 1) {
                this._addressInput.val(customerInfo.address);
            }
            customerInfo.name && this._nameInput.val(customerInfo.name);*/

            this._searchOrders();
        },

        _initDatePicker: function () {
            var tomorrow = moment().add(1, 'd'),
                chosenDate = $('[name=orderDate]').val();

            moment.locale('ru');

            !chosenDate && $('[name=orderDate]').val(tomorrow.format('YYYY-MM-DD'));

            $('.datetimepicker').datetimepicker({
                inline: true,
                sideBySide: true,
                locale: 'ru',
                minDate: moment().startOf('day'),
                defaultDate: chosenDate || tomorrow,
                format: 'YYYY-MM-DD'
            })
            .on('dp.change', function (e) {
                $('[name=orderDate]').val(e.date.format('YYYY-MM-DD'));
            });
        },

        _onPhonesChange: function (e) {
            var value = this._phonesInput.val() || '';

            if (value.length < 2) {
                return;
            }

            this._searchOrders();
        },

        _onAddressChange: function (e) {
            var value = this._addressInput.val() || '';

            if (value.length < 3) {
                return;
            }

            this._searchOrders();
        },

        _onNameChange: function () {
            var value = this._nameInput.val() || '';

            if (value.length < 3) {
                return;
            }

            this._searchOrders();
        },

        _searchOrders: function () {
            this._customersGet(this._getSearchParams())
                .then(this._updateAutocomplete.bind(this))
                .fail(function () {
                    console.log('ERR_ORDER_SEARCH');
                    console.log(arguments);
                })
        },

        _getSearchParams: function () {
            return {
                phones: this._phonesInput.val(),
                name: (this._nameInput.val() || ''),
                address: (this._addressInput.val() || ''),
                city: this._citySelect.val(),
            }
        },

        _updateAutocomplete: function (data) {
            data = this._parseResponse(data);

            this._districtInput.autocomplete().setOptions({
                lookup: data.district && data.district.values  || []
            });

            this._phonesInput.autocomplete().setOptions({
                lookup: data.phones && data.phones.values  || []
            });

            this._nameInput.autocomplete().setOptions({
                lookup: data.name && data.name.values  || []
            });

            this._addressInput.autocomplete().setOptions({
                lookup: data.address && data.address.values  || []
            });
        },

        _customersGet: function (params) {
            return $.ajax({
                url: this._CUSTOMER_SEARCH_URL,
                data: params
            });
        },

        _parseResponse: function (response) {
            this._customers = response.customers || {};

            return response.data;
        }
    };

    win.poseidon.OrderNew.init();

}(window));