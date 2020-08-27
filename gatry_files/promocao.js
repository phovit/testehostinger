$(function(){
	$("#form-promocao-preco").mask("#.##0,00", {reverse: true});

	$('#form-promocao').validate({
		'rules' : {
			'data[nome]': {
				required : true,
				minlength: 3
			},
			'data[link]': {
				required : true,
				url: true
			},
			'data[preco]': {
				required : true
			}
		}
	});
})