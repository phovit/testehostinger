window.jQuery.fn.autosize = function() {
    return autosize(this);
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

$(function(){

	// Se tiver algum alerta, verifica se ele já foi fechado
	if($('.alert.alert-info, .alert.alert-danger, .alert.alert-success')) {

		var stored = localStorage['alerts_closed'];

		if(stored) {
			var alerts = JSON.parse(stored);

			for (var idx in alerts) {
				$('#alerta-mensagem-'+alerts[idx]).remove();
			}
		}

	}

	$(document).on('click', '.alert .close', function(e) {

		if(typeof $(this).data('mensagemId') == 'undefined') {
			return;
		}

		var stored = localStorage['alerts_closed'];
		var alerts;

		if(stored) {
			alerts = JSON.parse(stored);
		} else {
			alerts = [];
		}

		alerts.push($(this).data('mensagemId'));

		localStorage['alerts_closed'] = JSON.stringify(alerts);

	});

	function atencaoBox(){
		$.fancybox({
			content : '<section class="box-generico"><h2>Atenção!</h2><p>Você precisa estar logado para comentar ou responder!</p>	</section>',
			width : 250,
			padding : 0
		});
	}

	$('#CompartilharPromocao, #CompartilharAvaliacao').on('click', function(e) {

		if(!IS_LOGGED) {
			e.preventDefault();

			$.fancybox({
				content : '<section class="box-generico"><h2>Atenção!</h2><p>Você precisa estar logado para compartilhar promoções e avalições!</p>	</section>',
				width : 250,
				padding : 0
			});

			return;
		}

		var boxID = $(this).data('box');

		// Verifica se existe a div, senão envia por link mesmo
		if($(boxID).length) {
			e.preventDefault();

			$.fancybox(boxID, {
				type: 'inline',
				padding: 0,
				width: 450
			});
		}

	});

	$("img.lazy").lazyload({
		threshold : 5,
		placeholder: WEB_ROOT+'img/lazy.jpg'
	});

	$(".alert .close").on('click', function(){
		$(this).parent().fadeOut();
	});

	$('.fotos .fancybox').fancybox({
		padding: 2
	});

	$('#form-entrar').validate({
		'rules' : {
			'data[email]': {
				required : true,
				email : true
			},
			'data[senha]': {
				required : true
			}
		},
        submitHandler: function(form, event) {
            event.preventDefault();

            var l = $('#btn-login-normal').ladda();
            l.ladda('start');

            $.post(WEB_ROOT + 'user/login', {

                email: $("#form-entrar-email").val(),
                senha: $("#form-entrar-senha").val()

            }, function(retorno) {
                l.ladda('stop');


                if (retorno.success == false) {
                    $("#form-entrar-senha").val("");

                    l.ladda('stop');

                    swal("", retorno.message);
                } else {
                    window.location = WEB_ROOT;
                }

            });
        }

	});

	$('#link-entrar').fancybox({
		'type' : 'inline',
		'padding' : 0,
		'autoCenter' : true,
		'afterClose' : function(){
			$('#form-entrar').show();
		}
	});

	/**
	 * Funções para comentários
	**/
	var criarFormularioDeComentario = function(type, id, comentarioId, comentarioOriginalId){

		var box = null;
		if(typeof PAGE_LIVRE == 'undefined') {
			box = $('#comentarios-' + type + '-' + id);
		} else {
			box = $($.fancybox.isOpen ? '.fancybox-inner .comentarios' : '#comentarios-' + type + '-' + id);
		}

		// Verifica se existe formularios criados
		// Caso exista remova
		if(box.find('.form-resposta').length > 0)
			box.find('.form-resposta').remove();

		var userIMG = (typeof $('#fotoUsuario').prop("src") != "undefined") ? $('#fotoUsuario').prop("src") : WEB_ROOT+'img/user_foto.png';
		var userNAME = (typeof $('#nomeUsuario').html() != "undefined") ? $('#nomeUsuario').html() : 'Visitante';

		//html do formulário
		var html = ''+
			'<li class="form-resposta" data-type="'+type+'">'+
				'<p>'+
					'<img alt="" src="'+userIMG+'"> <span>'+userNAME+'</span>'+
				'</p>'+
				'<form method="post" action="">'+
					'<textarea name="comentario"></textarea>'+
					'<input type="hidden" value="'+id+'" name="'+type+'_id" />'+
					((typeof comentarioId != 'undefined') ? '<input type="hidden" value="'+comentarioId+'" name="comentario_id" />' : "")+
					((typeof comentarioOriginalId != 'undefined') ? '<input type="hidden" value="'+comentarioOriginalId+'" name="comentario_original_id" />' : "")+
					'<a href="#" class="cancel-coments">cancelar</a>'+
					'<input type="submit" value="Comentar">'+
				'</form>'+
			'</li>';

			// console.log(html);
		//Se não for uma resposta
		//Adicione o formulario para comentar
		if(typeof comentarioId == 'undefined'){
			box.find('ul:first').prepend(html);
		}else{
			if(typeof PAGE_LIVRE != 'undefined' && comentarioId == comentarioOriginalId) {
				box.find('ul:first').prepend(html);
			} else {
				box.find('#comentario-'+comentarioId+' ul:first').prepend(html);
			}
		}

		//Autoresize para o textarea
		$('textarea').autosize();
	}

	$(document).on('click', '.cancel-coments', function(e){
		e.preventDefault();

		$(this).parent().parent().slideUp(function(){
			$(this).remove();
		});
	});

	$(document).on('focus', '.form-resposta form textarea', function(e){
		if(typeof $('#fotoUsuario').prop("src") == 'undefined' && typeof $('#nomeUsuario').html() == 'undefined'){
			atencaoBox();
		}
	});

	$(document).on('submit', '.form-resposta form', function(e){
		e.preventDefault();

		if(typeof $('#fotoUsuario').prop("src") == 'undefined' && typeof $('#nomeUsuario').html() == 'undefined'){
			atencaoBox();
			return;
		}

		//Pega div do formulario
		var formResposta = $(this).parent();
		var type = formResposta.data('type');

		//Campos do formulario
		var textarea = $(this).find('textarea');
		var submit = $(this).find('input[type=submit]');
		var id = $(this).find('input[name='+type+'_id]').val();
		var comentarioId = $(this).find('input[name=comentario_id]').val();
		var comentarioOriginalId = $(this).find('input[name=comentario_original_id]').val();

		//Box do comentário
		var box = null;
		if(typeof PAGE_LIVRE == 'undefined') {
			box = $('#comentarios-' + type + '-' + id);
		} else {
			box = $($.fancybox.isOpen ? '.fancybox-inner .comentarios' : '#comentarios-' + type + '-' + id);
		}

		if(textarea.val().length == 0){
			alert("Você precisa escrever um comentário antes de envia-lo.");
			return;
		}

		textarea.prop('disabled',true);

		submit.val("Enviando...");
		submit.addClass('loading');

		var data = {
			comentario: textarea.val(),
		};
		data[type+"Id"] = id;

		if(typeof comentarioId != 'undefined'){
			data.comentarioId = comentarioId;
		}

		if(typeof comentarioOriginalId != 'undefined'){
			data.comentarioOriginalId = comentarioOriginalId;
		}

		$.post(WEB_ROOT + 'promocao/comentar',  data, function(html){
			if(html.length == 0){
				window.location.reload();
				return;
			}

			box.find('.nenhum-comentario').remove();
			formResposta.hide();

			if(typeof comentarioId == 'undefined'){
				if($('.promocoes').hasClass('blackfriday')) {
					box.find('ul:first').prepend(html);
				} else {
					box.find('ul:first').append(html);
				}
			}else{
				if(typeof PAGE_LIVRE == 'undefined') {
					box.find('#comentario-'+comentarioId+' ul:first').append(html);
				} else {
					if(comentarioId == comentarioOriginalId) {
						box.find('ul:first').append(html);
					} else {
						box.find('#comentario-' + comentarioId + ' ul:first').append(html);
					}
				}
			}

		});
	});

	$(document).on('click', '.show-lightbox-comments', function(e){
		e.preventDefault();

		var id = $(this).data('id');
		// var comentariosBox = $('#promocao-'+id+' .comentarios');
		var box = $('#comentarios-promocao-'+id);

		//Limpa todo box de comentário e adiciona a mensagem de carregando comentários
		box.html('<ul><li class="loading">Carregando comentários...</li></ul>');

		$.fancybox({
			type: 'inline',
			href: box.selector,
			width: 800
		});

		$.get(WEB_ROOT+'promocao/comentarios/'+id, function(r){
			box.find('.loading').remove();
			box.find('ul:first').append(r);

			$.fancybox.update();

			criarFormularioDeComentario('promocao', id);
		});
	});

	$(document).on('click', '.responder-comentario, .comentar', function(e){
		e.preventDefault();

		var type = $(this).data('type');
		var id = $(this).data(type);
		var comentario = $(this).data('comentario');
		var comentarioOriginal = $(this).data('comentarioOriginal');

		if(typeof PAGE_LIVRE != 'undefined' && !$.fancybox.isOpen && typeof comentarioOriginal != 'undefined') {

			// box-content-comentario
			$.fancybox({
				type: 'inline',
				href: $('#comentario-' + comentarioOriginal + ' .comentarios').selector,
				width: 800
			});

			// Fix para forçar o estado de aberto
			$.fancybox.isOpen = true;

		}

		criarFormularioDeComentario(type, id, comentario, comentarioOriginal);

		if(typeof PAGE_LIVRE == 'undefined') {
			var offset = ($(".form-resposta").offset().top - $("#comentarios-"+type+"-"+id).offset().top) - $(".form-resposta").height();
			$('.fancybox-inner').animate({ scrollTop: offset}, 'slow');
		}

		if($(this).hasClass('responder-comentario')) {
			$(this).closest('li').find('.respostas').show();
		}
	});

  	$(document).on('click', '.editar-comentario', function(e){
  		e.preventDefault();

  		if($('.form-resposta').length > 0) $('.form-resposta').remove();

  		var comentarioID = $(this).data('comentario');
  		var comentarioOriginalID = $(this).data('comentarioOriginal');

  		var contentComentario = $('#comentario-'+comentarioID+' .content-comentario:first').html();
  		contentComentario = contentComentario.replace(/<br\s*[\/]?>/gi, '');

  		var html = ''+
			'<form method="post" action="">'+
				'<textarea name="comentario">'+contentComentario+'</textarea>'+
				'<a href="#" class="cancel-editar-comentario">cancelar</a>'+
				'<input type="hidden" value="'+comentarioID+'" name="comentario_id" />'+
				'<input type="hidden" value="'+comentarioOriginalID+'" name="comentario_original_id" />'+
				'<input type="submit" value="Atualizar comentário">'+
			'</form>';

		$('#comentario-'+comentarioID+' .box-editar-comentario:first').html(html).show();
		$('#comentario-'+comentarioID+' .box-content-comentario:first').hide();

		$('textarea').autosize();
  	});

  	$(document).on('click', '.cancel-editar-comentario', function(e){
  		$(this).parent().parent().parent().find('.box-content-comentario').show();
  		$(this).parent().parent().hide().html('');
  	});

  	$(document).on('submit', '.box-editar-comentario form', function(e){
		e.preventDefault();

		var formResposta = $(this).parent();
		var textarea = $(this).find('textarea');
		var comentarioId = $(this).find('input[name=comentario_id]');
		var submit = $(this).find('input[type=submit]');

		if(textarea.val().length > 0){
			textarea.prop('disabled',true);

			submit.val("Enviando...");
			submit.addClass('loading');

			var data = {
					comentario: textarea.val(),
					comentarioId: comentarioId.val()
				};

			$.post(WEB_ROOT+'promocao/editar_comentario',  data, function(r){

				if(r.error == true){
					window.location = WEB_ROOT;
					return;
				}

				formResposta.parent().find('.box-content-comentario').show().find('.content-comentario').html(r.comentario);

				formResposta.hide().html('');
			});

		}else{
			alert("Você precisa escrever um comentário antes de envia-lo.");
		}

	});

	var checkLogadoClicked = function(){
		if($('header .logado img').hasClass('clicked')){
			$('.logado ul').hide();
			$('header .logado img').removeClass('clicked');
			return true;
		}
		return false;
	}

	var checkCompartilharClicked = function(){
		if($('.btn-compartilhar').hasClass('clicked')){
			$('.compartilhar ul').hide();
			$('.btn-compartilhar').removeClass('clicked');
			return true;
		}
		return false;
	}

	$('html').click(function() {
		checkLogadoClicked();
	});

	$('.btn-compartilhar').on('click', function (e){
		e.preventDefault();
		e.stopPropagation();

		if(!checkCompartilharClicked()){
			checkLogadoClicked();
			$('.compartilhar ul').show();
			$(this).addClass('clicked');
		}
	});

	$('header .logado img').on('click', function(e){
		e.preventDefault();
		e.stopPropagation();

		if(!checkLogadoClicked()){
			checkCompartilharClicked();
			$('.logado ul').show();
			$(this).addClass('clicked');
		}
	});

	$('header .logado a').on('click', function (e){
		$('.logado ul').hide();
		$('.logado img').removeClass('clicked');
	});

	//Bullets
	var currentTitle = document.title;

	function checkBullets(){
		$.get(WEB_ROOT+'home/bullets', { data : DATA_ACESSO }, function(data){
			var total = 0; //data.promocoes+ data.avaliacoes+ data.comentarios;

			if(data.promocoes > 0){
				total += data.promocoes;
				$('#bullet-promocoes').html(data.promocoes).show();
			}

			// Alteração para a blackfriday, mudar depois par a > 0
			if(data.comentarios >= 5){
				total += data.comentarios;
				$('#bullet-comentarios').html(data.comentarios).show();
			}

			if(data.avaliacoes > 0){
				total += data.avaliacoes;
				$('#bullet-avaliacoes').html(data.avaliacoes).show();
			}

			if(data.livres > 0){
				$('#bullet-livres').html(data.livres).show();
			}

			if(total > 0){
				document.title = "(" + ( total ) + ") " + currentTitle;
			}else{
				document.title = currentTitle;
			}

		});
	}

	setInterval(
		function(){
			checkBullets();
		},
		60000
	); //each 1minute

	//Likes
	$(document).on('click', '.curtidas', function(e){
		e.preventDefault();

		var data = {};
		if(typeof $(this).data('promocao') != 'undefined'){
			data.promocaoId = $(this).data('promocao');
		}

		if(typeof $(this).data('comentario') != 'undefined'){
			data.comentarioId = $(this).data('comentario');
		}

		var that = $(this);
		that.addClass('loading');

		$.post(WEB_ROOT+'curtir', data, function(e){
			var span = that.find('span');
			var qtd = span.html();

			if(e.error){
				alert(e.mensagem);
			}else if(e.ja_curtiu == false){
				span.html(parseInt(qtd) + 1);
			}
			that.removeClass('loading');

		});

	});

	$(document).on('click', '.reportar-comentario', function(e) {
		e.preventDefault();

		var comentarioId = $(this).data('comentario');

		swal({
		  title: "Reportar comentário",
		  text: "Deseja realmente reportar este comentário, não será possível refazer esta ação.",
		  type: "warning",
		  showCancelButton: true,
		  confirmButtonColor: "#24aa98",
		  confirmButtonText: "Sim, tenho certeza!",
		  cancelButtonText: "Não",
		  closeOnConfirm: false
		},
		function(){
			$.post(WEB_ROOT + 'comentario/reportar_comentario', {
				comentario_id: comentarioId
			}, function(r){

				if(r.success) {
					swal("", r.message, "success");
					return;
				}

				swal("Ooops!", r.message, "error");
			});
		});

	});

	$('.scroll-to-top').click(function() {
        $("html, body").animate({scrollTop:0}, 500, 'swing');
	});

});

jQuery.extend(jQuery.validator.messages, {
    required: "Este campo é obrigatório.",
    remote: "Please fix this field.",
    email: "Insira um e-mail válido.",
    url: "Insira uma URL válida.",
    date: "Insira uma data válida.",
    dateISO: "Insira uma data válida (ISO).",
    number: "Insira um número válido.",
    digits: "Insira apenas números.",
    creditcard: "Please enter a valid credit card number.",
    equalTo: "Digite o mesmo valor do campo acima.",
    accept: "Adicione um arquivo com a extensão válida.",
    maxlength: jQuery.validator.format("Digite no máximo {0} caracteres."),
    minlength: jQuery.validator.format("Digite no mínimo {0} caracteres."),
    rangelength: jQuery.validator.format("Digite um valor entre {0} e {1}."),
    range: jQuery.validator.format("Digite um valor entre {0} e {1}."),
    max: jQuery.validator.format("Digite um valor menor ou igual a {0}."),
    min: jQuery.validator.format("Digite um valor maior ou igual a {0}.")
});