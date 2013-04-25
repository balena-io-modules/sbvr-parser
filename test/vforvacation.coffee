typeVocab = require('fs').readFileSync(__dirname + '/Type.sbvr')
test = require('./test')(typeVocab)
{term, verb, factType, conceptType, termForm, referenceScheme, necessity, rule, conceptType, note} = require('./sbvr-helper')
shortTextType = term 'Short Text', 'Type'
textType = term 'Text', 'Type'
integerType = term 'Integer', 'Type'
realType = term 'Real', 'Type'
dateType = term 'Date', 'Type'
lengthType = term 'Length', 'Type'

has = verb 'has'
isOf = verb 'is of'
name = term 'name'
locale = term 'locale'
language = term 'language'
region = term 'region'
country = term 'country'
latitude = term 'latitude'
longitude = term 'longitude'
city = term 'city'
media = term 'media'
tourType = term 'tour type'
mediaType = term 'media type'
comment = term 'comment'
durationInDays = term 'duration in days'
plan = term 'plan'
tour = term 'tour'
path = term 'path'
title = term 'title'
description = term 'description'
keyword = term 'keyword'
departureDate = term 'departure date'
availability = term 'availability'
singlePrice = term 'single price'
doublePrice = term 'double price'
airFee = term 'air fee'
application = term 'application'
itinerary = term 'itinerary'
overnights = term 'overnights'
order = term 'order'
dayNumber = term 'day number'
location = term 'location'
story = term 'story'
recommendation = term 'recommendation'
link = term 'link'
banner = term 'banner'
requirement = term 'requirement'
firstName = term 'first name'
lastName = term 'last name'
email = term 'email'
subscriber = term 'subscriber'
recipientGroup = term 'recipient group'
service = term 'service'
option = term 'option'
site = term 'site'
value = term 'value'
page = term 'page'
body = term 'body'
url = term 'url'
linkCategory = term 'link category'
width = term 'width'
height = term 'height'

regionTranslation = term 'region translation'
countryTranslation = term 'country translation'
cityTranslation = term 'city translation'
mediaTranslation = term 'media translation'
tourTypeTranslation = term 'tour type translation'
tourTranslation = term 'tour translation'
applicationTranslation = term 'application translation'
storyTranslation = term 'story translation'
requirementTranslation = term 'requirement translation'
recommendationTranslation = term 'recommendation translation'
linkTranslation = term 'link translation'
bannerTranslation = term 'banner translation'
serviceInclusion = term 'service inclusion'
serviceExclusion = term 'service exclusion'
siteOption = term 'site option'
pageTranslation = term 'page translation'

describe 'vforvacation', ->
	# Term:	   name
	test name
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Term:      locale
	test locale
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# 	Necessity: each locale has a Length (Type) that is equal to 2.
	test necessity 'each', locale, has, 'a', [lengthType, verb('is equal to'), 2]

	# Term:      language
	test language
	# Fact type: language has name
	test factType language, has, name
	# 	Necessity: each language has exactly one name.
	test necessity 'each', language, has, ['exactly', 'one'], name
	# 	Necessity: each name is of exactly one language.
	test necessity 'each', name, isOf, ['exactly', 'one'], language
	# Fact type: language has locale
	test factType language, has, locale
	# 	Necessity: each language has exactly one locale.
	test necessity 'each', language, has, ['exactly', 'one'], locale
	# 	Necessity: each locale is of exactly one language.
	test necessity 'each', locale, isOf, ['exactly', 'one'], language

	# Term:      region
	test region
	# Fact type: region is available in language
	test factType region, verb('is available in'), language
	# 	Term Form: region translation
	test termForm regionTranslation

	# Fact type: region translation has name
	test factType regionTranslation, has, name
	#     Necessity: each region translation has exactly one name.
	test necessity 'each', regionTranslation, has, ['exactly', 'one'], name

	# Term:      country
	test country
	# Fact type: country is available in language
	test factType country, verb('is available in'), language
	# 	Term Form: country translation
	test termForm countryTranslation
	# Fact type: country is of region
	test factType country, isOf, region
	# 	Necessity: each country is of exactly one region.
	test necessity 'each', country, isOf, ['exactly', 'one'], region

	# Fact type: country translation has name
	test factType countryTranslation, has, name
	# 	Necessity: each country translation has exactly one name.
	test necessity 'each', countryTranslation, has, ['exactly', 'one'], name

	# Term:      latitude
	test latitude
	# 	Concept Type: Real (Type)
	test conceptType realType

	# Term:      longitude
	test longitude
	# 	Concept Type: Real (Type)
	test conceptType realType

	# Term:      city
	test city
	# Fact type: city has latitude
	test factType city, has, latitude
	# 	Necessity: each city has exactly one latitude.
	test necessity 'each', city, has, ['exactly', 'one'], latitude
	# Fact type: city has longitude
	test factType city, has, longitude
	# 	Necessity: each city has exactly one longitude.
	test necessity 'each', city, has, ['exactly', 'one'], longitude
	# Fact type: city is available in language
	test factType city, verb('is available in'), language
	# 	Term Form: city translation
	test termForm cityTranslation
	# Fact type: city is of country
	test factType city, isOf, country
	# 	Necessity: each city is of exactly one country.
	test necessity 'each', city, isOf, ['exactly', 'one'], country

	# Fact type: city translation has name
	test factType cityTranslation, has, name
	# 	Necessity: each city translation has exactly one name.
	test necessity 'each', cityTranslation, has, ['exactly', 'one'], name

	# Term:      media type
	test mediaType
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Term:      path
	test path
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# 	Necessity: each path has a Length (Type) that is less than or equal to 100.
	test necessity 'each', path, has, 'a', [lengthType, verb('is less than or equal to'), 100]

	# Term:      media
	test media
	# Fact type: media has path
	test factType media, has, path
	# 	Necessity: each media has exactly one path.
	test necessity 'each', media, has, ['exactly', 'one'], path
	# Fact type: media is available in language
	test factType media, verb('is available in'), language
	# 	Term Form: media translation
	test termForm mediaTranslation

	# Term:      title
	test title
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Term:      description
	test description
	# 	Concept Type: Text (Type)
	test conceptType textType
	# 	Necessity: each description has a Length (Type) that is less than or equal to 2000.
	test necessity 'each', description, has, 'a', [lengthType, verb('is less than or equal to'), 2000]

	# Fact type: media translation has title
	test factType mediaTranslation, has, title
	#     Necessity: each media translation has exactly one title.
	test necessity 'each', mediaTranslation, has, ['exactly', 'one'], title
	# Fact type: media translation has description
	test factType mediaTranslation, has, description
	#     Necessity: each media translation has exactly one description.
	test necessity 'each', mediaTranslation, has, ['exactly', 'one'], description

	# Term:      tour type
	test tourType
	# Fact type: tour type is available in language
	test factType tourType, verb('is available in'), language
	# 	Term Form: tour type translation
	test termForm tourTypeTranslation

	# Fact type: tour type translation has name
	test factType tourTypeTranslation, has, name
	#     Necessity: each tour type translation has exactly one name.
	test necessity 'each', tourTypeTranslation, has, ['exactly', 'one'], name

	# Term:      keyword
	test keyword
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# 	Necessity: each keyword has a Length (Type) that is less than or equal to 100.
	test necessity 'each', keyword, has, 'a', [lengthType, verb('is less than or equal to'), 100]

	# Term:	   tour
	test tour
	# Fact type: tour is of tour type
	test factType tour, isOf, tourType
	#     Necessity: each tour is of exactly one tour type.
	test necessity 'each', tour, isOf, ['exactly', 'one'], tourType
	# Fact type: tour has region
	test factType tour, has, region
	#     Necessity: each tour has at least one region.
	test necessity 'each', tour, has, ['at least', 'one'], region
	# Fact type: tour has keyword
	test factType tour, has, keyword
	# Fact type: tour has media
	test factType tour, has, media
	# Fact type: tour is recommended
	test factType tour, verb('is recommended')
	# Fact type: tour is coming soon
	test factType tour, verb('is coming soon')
	# Fact type: tour is hidden
	test factType tour, verb('is hidden')
	# Fact type: tour is honeymoon
	test factType tour, verb('is honeymoon')
	# Fact type: tour is available in language
	test factType tour, verb('is available in'), language
	# 	Term Form: tour translation
	test termForm tourTranslation

	# Term:      comment
	test comment
	# 	Concept Type: Text (Type)
	test conceptType textType
	# 	Necessity: each comment has a Length (Type) that is less than or equal to 1000.
	test necessity 'each', comment, has, 'a', [lengthType, verb('is less than or equal to'), 1000]

	# Fact type: tour translation has title
	test factType tourTranslation, has, title
	#     Necessity: each tour translation has exactly one title.
	test necessity 'each', tourTranslation, has, ['exactly', 'one'], title
	# Fact type: tour translation has description
	test factType tourTranslation, has, description
	#     Necessity: each tour translation has exactly one description.
	test necessity 'each', tourTranslation, has, ['exactly', 'one'], description
	# Fact type: tour translation has comment
	test factType tourTranslation, has, comment
	#     Necessity: each tour translation has exactly one comment.
	test necessity 'each', tourTranslation, has, ['exactly', 'one'], comment

	# Term:      duration in days
	test durationInDays
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      plan
	test plan
	# Fact type: plan has duration in days
	test factType plan, has, durationInDays
	# 	Necessity: each plan has exactly one duration in days.
	test necessity 'each', plan, has, ['exactly', 'one'], durationInDays
	# Fact type: plan is of tour
	test factType plan, isOf, tour
	# 	Necessity: each plan is of exactly one tour.
	test necessity 'each', plan, isOf, ['exactly', 'one'], tour
	# 	Necessity: each tour has at least one plan.
	test necessity 'each', tour, has, ['at least', 'one'], plan

	# Term:      departure date
	test departureDate
	# 	Concept Type: Date (Type)
	test conceptType dateType

	# Term:      availability
	test availability
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# 	Definition: "no data" or "none" or "low" or "medium" or "high"

	# Term:      single price
	test singlePrice
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      double price
	test doublePrice
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      air fee
	test airFee
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      application
	test application
	# Fact type: application has departure date
	test factType application, has, departureDate
	# 	Necessity: each application has exactly one departure date.
	test necessity 'each', application, has, ['exactly', 'one'], departureDate
	# Fact type: application has availability
	test factType application, has, availability
	# 	Necessity: each application has exactly one availability.
	test necessity 'each', application, has, ['exactly', 'one'], availability
	# Fact type: application has single price
	test factType application, has, singlePrice
	# 	Necessity: each application has exactly one single price.
	test necessity 'each', application, has, ['exactly', 'one'], singlePrice
	# Fact type: application has double price
	test factType application, has, doublePrice
	# 	Necessity: each application has exactly one double price.
	test necessity 'each', application, has, ['exactly', 'one'], doublePrice
	# Fact type: application has air fee
	test factType application, has, airFee
	# 	Necessity: each application has exactly one air fee.
	test necessity 'each', application, has, ['exactly', 'one'], airFee
	# Fact type: application is hot offer
	test factType application, verb('is hot offer')
	# Fact type: application is of plan
	test factType application, isOf, plan
	# 	Necessity: each application is of exactly one plan.
	test necessity 'each', application, isOf, ['exactly', 'one'], plan
	# 	Necessity: each plan has at least one application.
	test necessity 'each', plan, has, ['at least', 'one'], application
	# Fact type: application is available in language
	test factType application, verb('is available in'), language
	# 	Term Form: application translation
	test termForm applicationTranslation

	# Fact type: application translation has description
	test factType applicationTranslation, has, description
	# 	Necessity: each application translation has exactly one description.
	test necessity 'each', applicationTranslation, has, ['exactly', 'one'], description

	# Term:      overnights
	test overnights
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      order
	test order
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      itinerary
	test itinerary
	# Fact type: itinerary has overnights
	test factType itinerary, has, overnights
	# 	Necessity: each itinerary has exactly one overnights.
	test necessity 'each', itinerary, has, ['exactly', 'one'], overnights
	# Fact type: itinerary has order
	test factType itinerary, has, order
	# 	Necessity: each itinerary has exactly one order.
	test necessity 'each', itinerary, has, ['exactly', 'one'], order
	# Fact type: itinerary is of city
	test factType itinerary, isOf, city
	# 	Necessity: each itinerary is of exactly one city.
	test necessity 'each', itinerary, isOf, ['exactly', 'one'], city
	# Fact type: itinerary is of plan
	test factType itinerary, isOf, plan
	# 	Necessity: each itinerary is of exactly one plan.
	test necessity 'each', itinerary, isOf, ['exactly', 'one'], plan

	# Term:      day number
	test dayNumber
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      location
	test location
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# 	Necessity: each location has a Length (Type) that is less than or equal to 200.
	test necessity 'each', location, has, 'a', [lengthType, verb('is less than or equal to'), 200]

	# Term:      story
	test story
	# Fact type: story has day number
	test factType story, has, dayNumber
	# 	Necessity: each story has exactly one day number.
	test necessity 'each', story, has, ['exactly', 'one'], dayNumber
	# Fact type: story is of plan
	test factType story, isOf, plan
	# 	Necessity: each story is of exactly one plan.
	test necessity 'each', story, isOf, ['exactly', 'one'], plan
	# Fact type: story is available in language
	test factType story, verb('is available in'), language
	# 	Term Form: story translation
	test termForm storyTranslation

	# Fact type: story translation has location
	test factType storyTranslation, has, location
	#     Necessity: each story translation has exactly one location.
	test necessity 'each', storyTranslation, has, ['exactly', 'one'], location
	# Fact type: story translation has description
	test factType storyTranslation, has, description
	#     Necessity: each story translation has exactly one description.
	test necessity 'each', storyTranslation, has, ['exactly', 'one'], description

	# Term:      requirement
	test requirement
	# 	Note: Things a traveller must do before travelling
	test note 'Things a traveller must do before travelling'
	# Fact type: requirement is of tour
	test factType requirement, isOf, tour
	# 	Necessity: each requirement is of exactly one tour.
	test necessity 'each', requirement, isOf, ['exactly', 'one'], tour
	# Fact type: requirement is available in language
	test factType requirement, verb('is available in'), language
	# 	Term Form: requirement translation
	test termForm requirementTranslation

	# Fact type: requirement translation has description
	test factType requirementTranslation, has, description
	#     Necessity: each requirement translation has exactly one description.
	test necessity 'each', requirementTranslation, has, ['exactly', 'one'], description

	# Term:      recommendation
	test recommendation
	# 	Note: e.g. Malaria treatment
	test note 'e.g. Malaria treatment'
	# Fact type: recommendation is of tour
	test factType recommendation, isOf, tour
	# 	Necessity: each recommendation is of exactly one tour.
	test necessity 'each', recommendation, isOf, ['exactly', 'one'], tour
	# Fact type: recommendation is available in language
	test factType recommendation, verb('is available in'), language
	# 	Term Form: recommendation translation
	test termForm recommendationTranslation

	# Fact type: recommendation translation has description
	test factType recommendationTranslation, has, description
	#     Necessity: each recommendation translation has exactly one description.
	test necessity 'each', recommendationTranslation, has, ['exactly', 'one'], description

	# Term:      url
	test url
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Term:      link category
	test linkCategory
	# Fact type: link category has name
	test factType linkCategory, has, name
	# 	Necessity: each link category has exactly one name.
	test necessity 'each', linkCategory, has, ['exactly', 'one'], name

	# Term:      link
	test link
	# Fact type: link has url
	test factType link, has, url
	# 	Necessity: each link has exactly one url.
	test necessity 'each', link, has, ['exactly', 'one'], url
	# Fact type: link has link category
	test factType link, has, linkCategory
	# Fact type: tour has link
	test factType tour, has, link
	# Fact type: link is available in language
	test factType link, verb('is available in'), language
	# 	Term Form: link translation
	test termForm linkTranslation

	# Fact type: link translation has title
	test factType linkTranslation, has, title
	#     Necessity: each link translation has exactly one title.
	test necessity 'each', linkTranslation, has, ['exactly', 'one'], title

	# Term:      width
	test width
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      height
	test height
	# 	Concept Type: Integer (Type)
	test conceptType integerType

	# Term:      banner
	test banner
	# Fact type: banner is of media
	test factType banner, isOf, media
	# 	Necessity: each banner is of exactly one media.
	test necessity 'each', banner, isOf, ['exactly', 'one'], media
	# Fact type: banner has url
	test factType banner, has, url
	# 	Necessity: each banner has exactly one url.
	test necessity 'each', banner, has, ['exactly', 'one'], url
	# Fact type: banner has width
	test factType banner, has, width
	# 	Necessity: each banner has exactly one width.
	test necessity 'each', banner, has, ['exactly', 'one'], width
	# Fact type: banner has height
	test factType banner, has, height
	# 	Necessity: each banner has exactly one height.
	test necessity 'each', banner, has, ['exactly', 'one'], height
	# Fact type: banner is enabled
	test factType banner, verb('is enabled')
	# Fact type: banner is available in language
	test factType banner, verb('is available in'), language
	# 	Term Form: banner translation
	test termForm bannerTranslation

	# Fact type: banner translation has title
	test factType bannerTranslation, has, title
	#     Necessity: each banner translation has exactly one title.
	test necessity 'each', bannerTranslation, has, ['exactly', 'one'], title
	# Fact type: banner translation has description
	test factType bannerTranslation, has, description
	#     Necessity: each banner translation has exactly one description.
	test necessity 'each', bannerTranslation, has, ['exactly', 'one'], description

	# Term:    first name
	test firstName
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	#     Necessity: each first name has a Length (Type) that is less than or equal to 100.
	test necessity 'each', firstName, has, 'a', [lengthType, verb('is less than or equal to'), 100]

	# Term:    last name
	test lastName
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	#     Necessity: each last name has a Length (Type) that is less than or equal to 100.
	test necessity 'each', lastName, has, 'a', [lengthType, verb('is less than or equal to'), 100]

	# Term:    email
	test email
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Term:      subscriber
	test subscriber
	# Fact type: subscriber has first name
	test factType subscriber, has, firstName
	# 	Necessity: each subscriber has at most one first name.
	test necessity 'each', subscriber, has, ['at most', 'one'], firstName
	# Fact type: subscriber has last name
	test factType subscriber, has, lastName
	# 	Necessity: each subscriber has at most one last name.
	test necessity 'each', subscriber, has, ['at most', 'one'], lastName
	# Fact type: subscriber has email
	test factType subscriber, has, email
	# 	Necessity: each subscriber has exactly one email.
	test necessity 'each', subscriber, has, ['exactly', 'one'], email

	# Term:      recipient group
	test recipientGroup
	# Fact type: recipient group has name
	test factType recipientGroup, has, name
	# 	Necessity: each recipient group has exactly one name.
	test necessity 'each', recipientGroup, has, ['exactly', 'one'], name
	# Fact type: recipient group has subscriber
	test factType recipientGroup, has, subscriber

	# Term:      service
	test service
	# Fact Type: service has name
	test factType service, has, name
	# 	Necessity: each service has exactly one name.
	test necessity 'each', service, has, ['exactly', 'one'], name
	# Fact Type: service has language
	test factType service, has, language
	# 	Necessity: each service has exactly one language.
	test necessity 'each', service, has, ['exactly', 'one'], language

	# Fact type: tour includes service
	test factType tour, verb('includes'), service
	# 	Term form: service inclusion
	test termForm serviceInclusion
	# Fact type: service inclusion has order
	test factType serviceInclusion, has, order
	# 	Necessity: each service inclusion has exactly one order.
	test necessity 'each', serviceInclusion, has, ['exactly', 'one'], order
	# Fact type: service inclusion has description
	test factType serviceInclusion, has, description
	# 	Necessity: each service inclusion has exactly one description.
	test necessity 'each', serviceInclusion, has, ['exactly', 'one'], description

	# Fact type: tour excludes service
	test factType tour, verb('excludes'), service
	# 	Term form: service exclusion
	test termForm serviceExclusion
	# Fact type: service exclusion has order
	test factType serviceExclusion, has, order
	# 	Necessity: each service exclusion has exactly one order.
	test necessity 'each', serviceExclusion, has, ['exactly', 'one'], order
	# Fact type: service exclusion has description
	test factType serviceExclusion, has, description
	# 	Necessity: each service exclusion has exactly one description.
	test necessity 'each', serviceExclusion, has, ['exactly', 'one'], description

	# Term:       option
	test option
	# Fact type:  option has name
	test factType option, has, name
	# 	Necessity: each option has exactly one name
	test necessity 'each', option, has, ['exactly', 'one'], name

	# Term:       site
	test site
	# Fact type:  site has name
	test factType site, has, name
	# 	Necessity: each site has exactly one name
	test necessity 'each', site, has, ['exactly', 'one'], name
	# Fact type:  site supports option in language
	test factType site, verb('supports'), option, verb('in'), language
	# 	Term Form: site option
	test termForm siteOption

	# Term:       value
	test value
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Fact type:  site option has value
	test factType siteOption, has, value
	# 	Necessity: each site option has exactly one value
	test necessity 'each', siteOption, has, ['exactly', 'one'], value

	# Term:       page
	test page
	# Fact type: page is available in language
	test factType page, verb('is available in'), language
	# 	Term Form: page translation
	test termForm pageTranslation

	# Term:      body
	test body
	# 	Concept Type: Text (Type)
	test conceptType textType
	# 	Necessity: each body has a Length (Type) that is less than or equal to 2000.
	test necessity 'each', body, has, 'a', [lengthType, verb('is less than or equal to'), 2000]

	# Fact type:  page translation has title
	test factType pageTranslation, has, title
	# 	Necessity: each page translation has exactly one title
	test necessity 'each', pageTranslation, has, ['exactly', 'one'], title
	# Fact type:  page translation has body
	test factType pageTranslation, has, body
	# 	Necessity: each page translation has exactly one body
	test necessity 'each', pageTranslation, has, ['exactly', 'one'], body
