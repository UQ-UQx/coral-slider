angular.module('coralSlider', ['components'])
  .controller('GrowthCtrl', function($scope) {
    $scope.Math = window.Math;
    $scope.calciLevel = 50;
    $scope.decalciLevel = 50;
    $scope.growthRate = 0;
    $scope.positiveGrowthHeight = '0px';
    $scope.positiveGrowthTop = '120px';
    $scope.negativeGrowthHeight = '0px';
    $scope.coralPosition = 0;

    $scope.updateProgress = function(growthRate) {
      $scope.growthRate = growthRate;

      if (growthRate > 0) {
        var progressHeight = growthRate * 120;
        var progressTop = 120 - (growthRate * 120);
        $scope.negativeGrowthHeight = '0px';
        $scope.positiveGrowthHeight = progressHeight + 'px';
        $scope.positiveGrowthTop = progressTop + 'px';
      }
      else {
        var progressHeight = -1 * growthRate * 120;
        $scope.positiveGrowthHeight = '0px';
        $scope.positiveGrowthTop = '120px';
        $scope.negativeGrowthHeight = progressHeight + 'px';
      }
      $scope.$broadcast('sliderChanged', {'rate': growthRate});
    };

    $scope.$watch('calciLevel', function(value) {
      $scope.updateProgress((value - $scope.decalciLevel) / 100);
    }, true);

    $scope.$watch('decalciLevel', function(value) {
      $scope.updateProgress(($scope.calciLevel - value) / 100);
    }, true);
});

angular.module('components', [])
  .directive('calciSlider', function($parse) {
    return {
      restrict: 'A',
      replace: true,
      template: '<input type="text"></input>',
      link: function(scope, element, attrs) {
        var model = $parse(attrs.model);
        var slider = $(element[0]).slider();

        slider.on('slideStop', function(ev) {
          model.assign(scope, ev.value);
          scope.$apply();
        });
      }
    }
  })
  .directive('coralVid', function($parse) {
    return {
      restrict: 'A',
      replace: true,
      template: '<video preload="auto"></video>',
      scope: {
        'currTime': '='
      },
      link: function(scope, element, attrs) {
        var coralVid = $(element[0]);
        var addSourceToVideo = function(element, src, type) {
          var source = document.createElement('source');

          source.src = src;
          source.type = type;

          element.appendChild(source);
        }

        scope.currTime = 0;
        scope.vidDuration = 0;

        if ((attrs.vidName !== undefined) && (attrs.vidName !== null) && (attrs.vidName.trim() !== '')) {
          addSourceToVideo(element[0], 'http://online.ceit.uq.edu.au/sites/default/files/uqx-public/' + attrs.vidName + '.mp4', 'video/mp4');
          addSourceToVideo(element[0], 'http://online.ceit.uq.edu.au/sites/default/files/uqx-public/' + attrs.vidName + '.ogv', 'video/ogg');

          coralVid[0].onloadeddata = function() {
            scope.vidDuration = this.duration;

            coralVid.on('timeupdate', function(ev) {
              var timeChanged = false;
              var timeFormatted = Math.round(ev.target.currentTime * 10) / 10;
              scope.currTime = timeFormatted;

              if (((scope.growthRate < 0) && (scope.currTime < (scope.vidDuration / 2))) ||
                  ((scope.growthRate > 0) && (scope.currTime > (scope.vidDuration / 2)))) {
                ev.target.play();
                scope.currTime = scope.vidDuration - scope.currTime;
                timeChanged = true;
              }

              if (timeChanged) {
                if (scope.currTime > scope.vidDuration) {
                  ev.target.pause();
                  scope.currTime = scope.vidDuration;
                }

                ev.target.currentTime = scope.currTime;
              }

              scope.$apply();
            });

            scope.$on('sliderChanged', function(event, args) {
              scope.growthRate = args.rate;

              // Video fully loaded on readyState = 4.
              if ((coralVid[0].readyState === 4) || (coralVid[0].readyState === 2)) {
                coralVid[0].playbackRate = Math.abs(args.rate);
                coralVid[0].defaultPlaybackRate = Math.abs(args.rate);
                coralVid[0].play();
              }
            });
          }
        }
      }
    }
  })
  .directive('twoWayProgress', function($parse) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var twoWayProgress = $(element[0]);
      }
    }
}); 