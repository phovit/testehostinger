$(function(){

	var loading = false;
	var userClickLoadMore = false;

	$('.carregar-mais-promocoes').on('click', function(e){
		e.preventDefault();
		// e.stopPropagation();

		userClickLoadMore = true;

		if(loading) return;

		loading = true;

		if($(this).html() == 'Carregando, aguarde...') return;

		var link = $(this);

		link.html("Carregando, aguarde...");

		var params = {qtde: $('.lista-promocoes article').length };

		if(typeof $(this).data('promocao') != 'undefined'){
			params.onlyPromocao = true;
		}

		if(typeof $(this).data('q') != 'undefined'){
			params.q = $(this).data('q');
		}

		var scrollTop = document.documentElement.scrollTop;

		$.get(WEB_ROOT+'home/mais_promocoes', params, function(r){
			link.html("Carregar mais...");

			// console.log(r);
			$('.lista-promocoes').append(r);

			$("img.lazy").lazyload({
				threshold : 5
			});

			window.scrollTo(0, scrollTop);
			loading = false;
		});
	});

	/*
	 * Infinit loading
	 */
	$(window).on('scroll', function(e){
		if (!userClickLoadMore) return;
		if ($('.carregar-mais-promocoes').length == 0) return;

		if ($(window).scrollTop() >= $(document).height() - $(window).height() - 10) {
			$('.carregar-mais-promocoes').click();
		}
	});

})