from django.http import HttpResponse, HttpResponseRedirect, Http404, HttpResponseServerError, HttpResponseBadRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404, render_to_response
from django.db.models import Q, Count, Sum, Max
from django.conf import settings
from django.template import RequestContext
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.forms import PasswordChangeForm
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse
import django.contrib.auth.views
try:
    import simplejson as json
except Exception, e:
    import json
import urllib2
import sys
import re
import base64
from urlparse import urlparse

try:
    import simplejson as json
except Exception, e:
    import json
    
def base_url(request):
    """Adds the base url to the context."""
    base_url = settings.URL_BASE
    return {'BASE_URL': base_url}
    
def index(request):    
    widgets = [];

    widgets.append({
        "id": 1,
        "type": "application",
        "title": "APPLICATION TITLE",
        "dataPoints": [],
        "displayDataPoints": 5,
        "timerInterval": 1,
        "timerIntervalCounter": 0,
        "config": {"application": "", "metric": "cpu", "grain": "1min", "tick_agg": "sum", "numberFormat": "microseconds",},
    })
    widgets.append({
        "id": 2,
        "type": "business",
        "title": "BUSINESS TITLE",
        "dataPoints": [],
        "displayDataPoints": 60,
        "timerInterval": 1,
        "timerIntervalCounter": 0,
        "config": {"metricType": "counter", "metric": "", "grain": "1min", "tick_agg": "sum", "numberFormat": "number", "hwb": "1",},
    })
    widgets.append({
        "id": 3,
        "type": "system",
        "title": "SYSTEM TITLE",
        "dataPoints": [],
        "displayDataPoints": 0,
        "timerInterval": 1,
        "timerIntervalCounter": 0,
        "config": {"metric": "cpu", "serverTagId": 0, "serverId": 0,},
    })

    return render_to_response("main_index.html", {"widgets": widgets}, context_instance=RequestContext(request))

# -----------------------------------
#           APPFIRST API's
# -----------------------------------

def api_application_metrics_list(request):
    url = settings.API_BASE_URL + "metrics/names/?path=sys.app"
    return api_get_data(url)
        
def api_business_metrics_list(request):
    url = settings.API_BASE_URL + "metrics/names/?path=biz." + request.GET.get("metric_type", "counter")
    return api_get_data(url)
    
def api_servers(request):
    url = settings.API_BASE_URL + "servers"
    return api_get_data(url)

def api_server_tags(request):
    url = settings.API_BASE_URL + "server_tags"
    return api_get_data(url)
            
def api_application_metrics_data(request):
    hwb = request.GET.get("hwb", "0")

    url = settings.API_BASE_URL + "metrics/"
    url += "?name=sys.app." + request.GET.get("application", None) + "." + request.GET.get("metric", None)
    url += "&num=" + request.GET.get("num", "60")
    url += "&grain=" + request.GET.get("grain", "1min")
    url += "&tick_agg=" + request.GET.get("tick_agg", "sum")
    
    return api_get_data(url)
        
def api_business_metrics_data(request):
    hwb = request.GET.get("hwb", "0")

    url = settings.API_BASE_URL + "metrics/"
    url += "?name=" + request.GET.get("metric", None)
    url += "&num=" + request.GET.get("num", "60")
    url += "&grain=" + request.GET.get("grain", "1min")
    url += "&tick_agg=" + request.GET.get("tick_agg", "sum")

    if hwb == "1":
        url += "&transform=[%22holt_winters%22,+%22identity%22]"

    return api_get_data(url)

def api_system(request):
    server_tag_id = int(request.GET.get("server_tag_id", "0"))
    server_id = int(request.GET.get("server_id", "0"))

    url = settings.API_BASE_URL + "afd_system_data"
    url += "/" + request.GET.get("server_tag_id", "0") + "/"
    url += "?serverid=" + request.GET.get("server_id", "0")
    url += "&metric=" + request.GET.get("metric", "cpu")

    return api_get_data(url)

def api_get_data(url):
    base64string = base64.encodestring('%s:%s' % (settings.USERNAME, settings.API_KEY))[:-1]
    authheader =  "Basic %s" % base64string

    req = urllib2.Request(url)
    req.add_header("Authorization", authheader)

    try:
        handle = urllib2.urlopen(req)
    except IOError, e:
        sys.exit(1)
        
    return_data = handle.read()

    return HttpResponse(return_data, mimetype="application/json")