/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/scripts/dkms_eligibility.js. */
(function($){Drupal.behaviors.dkms_eligibility={attach:function(context,settings){$('div.elig-content').hide();$('#step1').show();var $elig=$('#elig-steps');$elig.children().each(function(e){if($(this).css('position')=='fixed'){var $questionContainer=$(this).children('.questions'),$question=$(this).find('.question'),$questionTitle=$(this).children('.questions').children('h2'),$questionButtons=$(this).find('.buttons'),$questionClose=$(this).find('.close'),reservedHeight=$questionContainer.actual('outerHeight')-($($questionTitle).actual('outerHeight')+parseInt($questionTitle.css('margin-bottom'))+$questionClose.actual('outerHeight')+parseInt($questionClose.css('top'))+$questionButtons.actual('outerHeight'));$question.css('height',reservedHeight+'px')}});$elig.find('.eligibility-navigation').click(function(event){event.preventDefault();var $this=$(this),next_id=$this.attr('href'),$nextStep=$(next_id);$nextStep.show().trigger('showEligibilityStep');fixButtonAlignment();var errorDiv=$elig.find('div.error');errorDiv.hide();var $contentDiv=$this.closest('div.elig-content');$contentDiv.hide()});$elig.find('form input',context).once(function(){if($(this).hasClass('keep-value')){$(this).toggleClass('value-kept')}else{this.defaultValue=this.value;$(this).click(function(){if(this.value==this.defaultValue)$(this).val("");return false});$(this).blur(function(){if(this.value=="")$(this).val(this.defaultValue)})}});jQuery(".bopup-popup").click(function(event){event.stopPropagation();jQuery("#bopup-layer").center();jQuery("#bopup-layer").bPopup({appendTo:'b-modal',positionStyle:'absolute'})});jQuery(".close-popup").click(function(event){event.stopPropagation();jQuery("#bopup-layer").bPopup().close()})}}})(jQuery)
function fixButtonAlignment(){var containerDiv='#elig-steps div.call-to-action';jQuery(containerDiv).css('width','auto')}
function isInvalidNumber(num){if(!isNaN(num)&&num>=0)return false;return true};jQuery(window).on('orientationchange',function(){fixButtonAlignment()});jQuery(window).resize(function(){fixButtonAlignment()});var updateOrientation=function(){fixButtonAlignment()}
function addBioMetricsToRegistrationLink(){var link=jQuery('#registerlink').attr('href'),kg=parseFloat(jQuery('form#bmi-metric').find('input[name=metric-weight]').val()),cm=parseFloat(jQuery('form#bmi-metric').find('input[name=metric-height]').val()),st=parseFloat(jQuery('form#bmi-uk').find('input[name=uk-st]').val()),lbs=parseFloat(jQuery('form#bmi-uk').find('input[name=uk-lb]').val()),ft=parseFloat(jQuery('form#bmi-uk').find('input[name=uk-ft]').val()),inch=parseFloat(jQuery('form#bmi-uk').find('input[name=uk-inch]').val()),lbs_us=parseFloat(jQuery('form#bmi-us').find('input[name=us-lb]').val()),ft_us=jQuery('form#bmi-us').find('select[name=us-ft]').val(),linkType='metric';if(jQuery("#bmi-metric").is(':visible'));else if(jQuery("#bmi-uk").is(':visible')){if(jQuery("#uk-st").is(':visible'))linkType='imperial'}else if(jQuery("#bmi-us").is(':visible'))linkType='us';var birthdate=jQuery('#birthdate_year').val()+"-"+jQuery('#birthdate_day').val()+"-"+jQuery('#birthdate_month').val();if(linkType!='us')birthdate=jQuery('#step2_birthdate_year').val()+"-"+jQuery('#step2_birthdate_day').val()+"-"+jQuery('#step2_birthdate_month').val();if(linkType=='metric'){link=removeImperial(link);link=addUrlParam(link,'weight',kg);link=addUrlParam(link,'height',cm)}else if(linkType=='imperial'){link=removeMetric(link);link=addUrlParam(link,'inches',inch);link=addUrlParam(link,'feet',ft);link=addUrlParam(link,'pounds',lbs);if(!isNaN(st))link=addUrlParam(link,'stone',st)}else{link=addUrlParam(link,'height',ft_us);link=addUrlParam(link,'pounds',lbs_us)};if(jQuery('form#birthdate').is(':visible'))link=addUrlParam(link,'birthdate',birthdate);if(birthdate!='')link=addUrlParam(link,'birthdate',birthdate);link=addUTMParams(link);jQuery('#registerlink').attr('href',link)}
function getCentimetersFromFeetAndInches(heightFt,heightInch){var feetToCM=heightFt*30.48,inchToCM=heightInch*2.54;height=feetToCM+inchToCM;return height}
function addUrlParam(url,name,value){var parameterPrefix='&';if(url.indexOf("?")==-1)parameterPrefix='?';if(url.indexOf(name)!=-1){url=replaceUrlParam(url,name,value)}else url+=parameterPrefix+name+"="+value;return url}
function removeAllWeightAndHeight(url){url=removeURLParameter(url,'weight');url=removeURLParameter(url,'height');url=removeURLParameter(url,'inches');url=removeURLParameter(url,'feet');url=removeURLParameter(url,'pounds');url=removeURLParameter(url,'stone');return url}
function removeMetric(url){url=removeURLParameter(url,'weight');url=removeURLParameter(url,'height');return cleanUrl(url)}
function removeImperial(url){url=removeURLParameter(url,'inches');url=removeURLParameter(url,'feet');url=removeURLParameter(url,'pounds');url=removeURLParameter(url,'stone');return cleanUrl(url)}
function replaceUrlParam(url,paramName,paramValue){var pattern=new RegExp('('+paramName+'=).*?(&|$)'),newUrl=url.replace(pattern,'$1'+paramValue+'$2');return newUrl}
function removeURLParameter(url,parameter){var urlparts=url.split('?');if(urlparts.length>=2){var prefix=encodeURIComponent(parameter)+'=',pars=urlparts[1].split(/[&;]/g);for(var i=pars.length;i-->0;)if(pars[i].lastIndexOf(prefix,0)!==-1)pars.splice(i,1);url=urlparts[0]+'?'+pars.join('&');return url}else return url}
function cleanUrl(url){var qPos=url.indexOf('?')+1;if(qPos==url.length||qPos==url.length)url=url.slice(0,-1);return url}
function addUTMParams(link){var utm_source=getUrlParam('utm_source',''),utm_medium=getUrlParam('utm_medium',''),utm_campaign=getUrlParam('utm_campaign','');if(link.indexOf('utm_source=')==-1&&utm_source!='')link=addUrlParam(link,'utm_source',utm_source);if(link.indexOf('utm_medium=')==-1&&utm_medium!='')link=addUrlParam(link,'utm_medium',utm_medium);if(link.indexOf('utm_campaign=')==-1&&utm_campaign!='')link=addUrlParam(link,'utm_campaign',utm_campaign);return link}
function getUrlParam(parameter,defaultvalue){var urlparameter=defaultvalue;if(window.location.href.indexOf(parameter)>-1)urlparameter=getUrlVars()[parameter];return urlparameter}
function getUrlVars(){var vars={},parts=window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(m,key,value){vars[key]=value});return vars};
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/scripts/dkms_eligibility.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_age/scripts/dkms_eligibility_step_age.js. */
(function($){Drupal.behaviors.dkms_eligibility_step_age={attach:function(context,settings){var $elig=$('#elig-steps');$elig.find('.step-age a.next').click(function(event){event.preventDefault();var errorDiv=$elig.find('div.error');errorDiv.hide();var error=false,$this=$(this),ageIsOk=false,ageTooLow=false,ageTooHigh=false;if($('#step_age_birthdate').is(':visible')){var minAge=18,maxAge=56,usDateFormat=0;if(settings&&settings.dkms_eligibility_step_age){minAge=settings.dkms_eligibility_step_age.min_age;maxAge=settings.dkms_eligibility_step_age.max_age;usDateFormat=settings.dkms_eligibility_step_age.us_dateformat};var bd_year=jQuery('#step_age_birthdate_year').val(),bd_month=jQuery('#step_age_birthdate_month').val(),bd_day=jQuery('#step_age_birthdate_day').val(),birthdate=bd_year+"-"+bd_month+"-"+bd_day,us_birthdate=bd_year+"-"+bd_day+"-"+bd_month;$('#step_age_birthdate').removeClass('error');if(bd_year==''||bd_month==''||bd_day==''){errorDiv.show();errorDiv.html(Drupal.t("Please select your date of birth"));error=true}else{var today=new Date(),birthdayDate=new Date(bd_year,(bd_month-1),bd_day,today.getHours(),today.getMinutes(),today.getSeconds(),today.getMilliseconds()),minAgeDate=new Date();minAgeDate.setFullYear(minAgeDate.getFullYear()-minAge);var maxAgeDate=new Date();maxAgeDate.setFullYear(maxAgeDate.getFullYear()-maxAge);if(birthdayDate<=minAgeDate&&birthdayDate>=maxAgeDate){ageIsOk=true}else if(birthdayDate<minAgeDate){ageTooLow=true}else ageTooHigh=true}};if(ageIsOk){next_id=$this.attr('data-succes');var regLink=$('#registerlink'),link=regLink.attr('href');if(usDateFormat=='1'){link=addUrlParam(link,'birthdate',us_birthdate)}else link=addUrlParam(link,'birthdate',birthdate);regLink.attr('href',link)}else next_id=$this.attr('data-fail');if(!error){var $nextStep=$(next_id);$nextStep.show().trigger('showEligibilityStep');fixButtonAlignment();var $contentDiv=$this.closest('div.elig-content');$contentDiv.hide()};if(typeof variable!=='dataLayer')if(!error){if(ageTooLow)dataLayer.push({Age:'Age too old'});if(ageTooHigh)dataLayer.push({Age:'Age too young'});if(ageIsOk)dataLayer.push({Age:'Age OK'})}});$elig.find('.back .eligibility-navigation').click(function(event){event.preventDefault();var $this=$(this),next_id=$this.attr('href'),$nextStep=$(next_id);if($nextStep.hasClass('step-age'))if(typeof variable!=='dataLayer')dataLayer.push({Age:''})})}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_age/scripts/dkms_eligibility_step_age.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_health/scripts/dkms_eligibility_step_health.js. */
(function($){Drupal.behaviors.dkms_eligibility_step_health={attach:function(context,settings){var $elig=$('#elig-steps'),$stephealthcheck=$('#step-health-check');$stephealthcheck.find('.close').click(function(){var $nextStep=$('.step-health',$elig);$nextStep.show().trigger('showEligibilityStep');fixButtonAlignment();$('#step-health-check').hide()});$stephealthcheck.find('.back a').each(function(){var $backstep=$('.step-health',$elig);$(this).attr('href','#'+$backstep.attr('id'))})}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_health/scripts/dkms_eligibility_step_health.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_measurements/scripts/dkms_eligibility_step_measurements.js. */
(function($){Drupal.behaviors.dkms_eligibility_step_measurements={attach:function(context,settings){var $elig=$('#elig-steps');$elig.find('.back .eligibility-navigation').click(function(event){event.preventDefault();var $this=$(this),next_id=$this.attr('href'),$nextStep=$(next_id);if($nextStep.hasClass('step-measurements'))if(typeof variable!=='dataLayer')dataLayer.push({BMI:''})})}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_measurements/scripts/dkms_eligibility_step_measurements.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_measurements/scripts/dkms_eligibility_step_measurements_metric.js. */
(function($){Drupal.behaviors.dkms_eligibility_step_measurements_metric={attach:function(context,settings){var minWeight=50,maxBMI=40,bmi=15,weight=50,height=100;if(settings&&settings.dkms_eligibility_step_measurements){minWeight=settings.dkms_eligibility_step_measurements.min_weight;maxBMI=settings.dkms_eligibility_step_measurements.max_bmi};var numericWarning='Field should be numeric!',numericIntegerWarning='Please, do not use a . or a , in this field.',weightLimitHighWarning='You have entered a weight that is above our limits.',weightLimitLowWarning='You have entered a weight that is below our limits.',weightLimitLowValue=50,heightLimitHighWarning='You have entered a height that is above our limits.';if(settings&&settings.dkms_eligibility){numericWarning=settings.dkms_eligibility.numeric_error;numericIntegerWarning=settings.dkms_eligibility.numeric_integer_error;weightLimitHighWarning=settings.dkms_eligibility.weight_limit_high_warning;weightLimitLowWarning=settings.dkms_eligibility.weight_limit_low_warning;weightLimitLowValue=settings.dkms_eligibility.weight_limit_low_value;heightLimitHighWarning=settings.dkms_eligibility.height_limit_high_warning};var $elig=$('#elig-steps');$elig.find('.step-measurements .buttons a.next').click(function(event){event.preventDefault();var metricForm=$('form#bmi-metric'),errorDiv=$elig.find('div.error');errorDiv.hide();var error=false,$this=$(this),bmi=15,weight=50,height=100,metricWeight=metricForm.find('input[name=metric-weight]');weight=parseInt(metricWeight.val());metricWeight.removeClass('error');if(isInvalidNumber(weight)){metricWeight.addClass('error');errorDiv.show();errorDiv.html(Drupal.t(numericWarning));error=true};if(weight>300){metricWeight.addClass('error');errorDiv.show();errorDiv.html(Drupal.t(weightLimitHighWarning));error=true};var metricHeight=metricForm.find('input[name=metric-height]'),checkMetricHeight=metricHeight.val();if(checkMetricHeight.indexOf('.')>-1||checkMetricHeight.indexOf(',')>-1){metricHeight.addClass('error');errorDiv.show();error=true;errorDiv.html(Drupal.t(numericIntegerWarning))};if(checkMetricHeight==''){metricHeight.addClass('error');errorDiv.show();error=true;errorDiv.html(Drupal.t(numericWarning))};height=parseInt(metricHeight.val());if(checkMetricHeight!=''&&isInvalidNumber(height)){metricHeight.addClass('error');errorDiv.show();error=true;errorDiv.html(Drupal.t(numericWarning));error=true};if(height>250){metricHeight.addClass('error');errorDiv.show();error=true;errorDiv.html(Drupal.t(heightLimitHighWarning));error=true};bmi=weight/Math.pow(height/100,2);var next_id=$this.attr('href');if(bmi<=maxBMI&&weight>=minWeight){next_id=$this.attr('data-succes');var regLink=$('#registerlink'),link=regLink.attr('href');link=removeAllWeightAndHeight(link);link=addUrlParam(link,'weight',weight);link=addUrlParam(link,'height',height);regLink.attr('href',link)}else next_id=$this.attr('data-fail');if(!error){var $nextStep=$(next_id);$nextStep.show().trigger('showEligibilityStep');fixButtonAlignment();var $contentDiv=$this.closest('div.elig-content');$contentDiv.hide();if(next_id=='#success')iOsScrollFix("#eligibility-module .intro","#eligibility-module #success p")};if(typeof variable!=='dataLayer'&&!error){if(bmi>maxBMI)dataLayer.push({BMI:'BMI too high'});if(weight<minWeight)dataLayer.push({BMI:'BMI too Low'});if(bmi<=maxBMI&&weight>=minWeight)dataLayer.push({BMI:'BMI OK'})}});var $switch=$('.step-measurements span.switch');if($switch.length>0){$switch.css('margin-top','11px');$('.metric',$switch).attr('href','').css({'font-size':'13px',cursor:'default',background:'none','padding-left':'0px'})}}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_measurements/scripts/dkms_eligibility_step_measurements_metric.js. */
;/*})'"*/
/* Source and licensing information for the line(s) below can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_success/scripts/dkms_eligibility_step_success.js. */
(function($){Drupal.behaviors.dkms_eligibility_step_success={attach:function(context,settings){var $elig=$('#elig-steps'),$successstep=$('.step-success',$elig),$timer=$('#registerlink').data('timer');$successstep.on('showEligibilityStep',function(event){setTimeout(function(){window.location.href=$('#registerlink').attr('href')},$timer)})}}})(jQuery);;
/* Source and licensing information for the above line(s) can be found at https://www.dkms.de/sites/all/modules/custom/dkms_eligibility/modules/dkms_eligibility_step_success/scripts/dkms_eligibility_step_success.js. */
;/*})'"*/
