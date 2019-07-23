var $filters = $('#filters');
var templatesAvailable = $('.template', '.templates').not('.filter-chooser').length;
var movies;

// console.log('inside script file');
// load script locally

$.getJSON('../movies.json', function(data) {
  // console.log('json loaded');
  movies = data;
  $(document).trigger('moviesLoaded');
});

// $.ajax({
//   url: 'https://github.com/bkcpro/jquery_host/blob/master/movies.json',
//   dataType: "jsonp",
//   function(data) {
//   // console.log('json loaded');
//     movies = data;
//     $(document).trigger('moviesLoaded');
//   }
// });

// $.getJSON('../movies.json', function(data) {
//   // console.log('json loaded');
//   movies = data;
//   $(document).trigger('moviesLoaded');
// });

function reAssignOptions(){

   var selectedOptions = $('.filter .filter-type').find(':selected');

   $options = $('.templates .filter-type').first().children().clone();
   // console.log($options);

   let filterInUse = $filters
           .children()
           .map(function() {
              return $(this)
                      .children('.template')
                      .attr('class')
                      .match(/\b(template-.+?)\b/g)[0];
           })
           .get();

   // console.log(filterInUse);

   console.log($('.filter')
        .children('.filter-type'));

   $('.filter')
        .children('.filter-type')
        .children().remove();

   // console.log($options);

   $('.filter .filter-type')
          .append($options);
          // .find('option[data-template-type]')
          // .filter(function(){
          //   selectedIndex = $('.filter').index($(this).closest('.filter'));
          //   // console.log('this... ', $(this), 'selectedoptions...', selectedOptions[selectedIndex]);
          //   if($(this).val() === selectedOptions[selectedIndex].value) {
          //     $(this).attr('selected', 'selected');
          //     return;
          //   }
          //   // console.log($(this).data('template-type'), filterInUse.indexOf($(this).data('template-type')));
          //   return filterInUse.indexOf($(this).data('template-type')) >= 0;
          // })
          // .remove();


}


 $(document).on('moviesLoaded', function() {
    $('#filters')
            .on('change', '.filter-type', function() {
               var $this = $(this);
               var $filter = $this.closest('.filter');
               var filterType = $this.find(':selected').data('template-type');

               $('.qualifier', $filter).remove();
               $('div.template.' + filterType)
                       .clone()
                       .addClass('qualifier')
                       .appendTo($filter);
               $this.find('option[value=""]').remove();

               reAssignOptions();
            })
            .on('click', '.filter-remover', function() {
               $(this).closest('.filter').remove();

               reAssignOptions();
            });

    $('#filter-add')
            .click(function() {
               // Check if the button was pressed before selecting a filter
               if ($filters.find('.template:last .filter-type').val() === '') {
                  return;
               }


               // Find filters already in use
               var filterInUse = $filters
                       .children()
                       .map(function() {

                          return $(this)
                                  .children('.template')
                                  .attr('class')
                                  .match(/\b(template-.+?)\b/g)[0];
                       })
                       .get();



               // All the filters available are already in use
               if (filterInUse.length === templatesAvailable) {
                  return;
               }

               var $filterChooser = $('div.template.filter-chooser')
                       .clone()
                       .removeClass('filter-chooser')
                       .addClass('filter');

               // Remove filters already in use
               $filterChooser
                       .find('option[data-template-type]')
                       .filter(function() {
                          return filterInUse.indexOf($(this).data('template-type')) >= 0;
                       })
                       .remove();
               $filterChooser.appendTo($filters);
            })
            .click();

    $('#form-filters').submit(function(event) {
       event.preventDefault();

       var titleCondition = $filters.find('select[name="title-condition"]').val();
       var title = $filters.find('input[name="title"]').val();
       var binderMin = parseInt($filters.find('input[name="binder-min"]').val(), 10);
       var binderMax = parseInt($filters.find('input[name="binder-max"]').val(), 10);
       var yearMin = parseInt($filters.find('input[name="year-min"]').val(), 10);
       var yearMax = parseInt($filters.find('input[name="year-max"]').val(), 10);
       var viewed = $filters.find('input[name="viewed"]:checked').val();

       // Clear previous results, but not headers
       $('tr:has(td)', '#results').remove();
       var results = $.grep(movies, function(element, index) {
          return (
                (
                     (titleCondition === undefined && title === undefined) ||
                     (titleCondition === 'contains' && element.title.indexOf(title) >= 0) ||
                     (titleCondition === 'starts-with' && element.title.indexOf(title) === 0) ||
                     (titleCondition === 'ends-with' && element.title.indexOf(title) === element.title.length - title.length) ||
                     (titleCondition === 'equals' && element.title === title)
                ) &&
                (isNaN(binderMin) || element.binder >= binderMin) &&
                (isNaN(binderMax) || element.binder <= binderMax) &&
                (isNaN(yearMin) || element.year >= yearMin) &&
                (isNaN(yearMax) || element.year <= yearMax) &&
                (viewed === undefined || element.viewed === (viewed === 'true'))
          );
       });

       var row;
       // This loop can be optimized but we wanted to recall that you can create an element on the fly using
       // jQuery. The optimization can be done putting all the rows as a string inside the variable "row" and
       // appending all the elements in one call after the loop.
       for(var i = 0; i < results.length; i++) {
          row = '<td>' + results[i].title + '</td>';
          row += '<td>' + results[i].year + '</td>';
          row += '<td>' + results[i].binder + '</td>';
          row += '<td>' + results[i].page + '</td>';
          row += '<td>' + results[i].slot + '</td>';
          row += '<td>' + (results[i].viewed ? 'X' : '') + '</td>';

          $('#results').append(
                  $('<tr>').html(row)
          );
       }
    });
 });
