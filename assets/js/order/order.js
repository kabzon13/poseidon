$(function () {
    var loadDistricts = function () {
            return $.ajax({
                url: '/customer/district',
                data: {
                    city: citySelect.val()
                }
            });
        },
        loadAddress = function () {
            console.log(arguments);
            return $.ajax({
                url: '/customer/address',
                data: {
                    city: citySelect.val(),
                    district: districtInput.val()
                }
            });
        },
        citySelect = $('[name=city]'),
        districtInput = $('[name=district]');

    citySelect.on('change', function () {
        districtInput.prop('disabled', true);
        loadDistricts()
            .done(function (values) {

                districtInput.autocomplete().clear();
                districtInput.autocomplete().setOptions({
                    lookup: values
                });
            })
            .fail(function () {
                console.log(arguments)
            })
            .always(function () {
                districtInput.prop('disabled', false);
            });
    });

    districtInput.autocomplete({
        lookup: districtInput.data('districts'),
        onSelect: loadAddress
    });
});