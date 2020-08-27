$(function() {
	$('#avaliacao').raty({
		scoreName: 'data[avaliacao]',
		starOff : WEB_ROOT+'js/raty/images/star-off.png',
		starOn  : WEB_ROOT+'js/raty/images/star-on.png'
	});

	$('#form-foto-avaliacao-tags').tagsInput({
		height: 'auto',
		width: '430px',
		defaultText: '',
		delimiter: [",", ";"," "]
	});

	$('#form-foto-avaliacao').on('submit', function(){

		if($("#form-foto-avaliacao-tags").val() == ""){
			alert("Insira no mínimo 1 tag!");
			return false;
		}

		if($("#form-foto-avaliacao-foto-principal").val() == ""){
			alert("Selecione a foto principal!");
			return false;
		}

		if($("#avaliacao").find('input[type=hidden]').val() == ""){
			alert("Você precisa selecionar a nota da avaliação!");
			return false;
		}

		var l = $('#box-foto-avaliacao input[type=submit]').ladda();
		l.ladda('start');

	});

});