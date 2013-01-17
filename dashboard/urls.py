from django.conf.urls.defaults import *
from django.conf import settings
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('', url(r'^admin/', include(admin.site.urls)))

if settings.ENVIRONMENT == "LOCAL":
	urlpatterns += patterns('',
	    (r'^site_media/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.MEDIA_ROOT}),
	    (r'^site_static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_FILES_ROOT}),
	)

urlpatterns += patterns('', (r'', include('dashboard.main.urls')))
