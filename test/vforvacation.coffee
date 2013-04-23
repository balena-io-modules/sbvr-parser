test = require('./test')()
{term, verb, factType, conceptType, referenceScheme, necessity, rule} = require('./sbvr-helper')
name = term 'name'
locale = term 'locale'
language = term 'language'
describe 'vforvacation', ->
	# Term:	   name
	test name
	# 	Concept Type: Short Text (Type)
	# 
	# Term:      locale
	test locale
	# 	Concept Type: Short Text (Type)
	# 	Necessity: each locale has a Length (Type) that is equal to 2.
	# 
	# Term:      language
	test language
	# Fact type: language has name
	test factType language, verb('has'), name
	# 	Necessity: each language has exactly one name.
	test necessity 'each', language, verb('has'), ['exactly', 'one'], name
	# 	Necessity: each name is of exactly one language.
	test necessity 'each', name, verb('is of'), ['exactly', 'one'], language
	# Fact type: language has locale
	test factType language, verb('has'), locale
	# 	Necessity: each language has exactly one locale.
	test necessity 'each', language, verb('has'), ['exactly', 'one'], locale
	# 	Necessity: each locale is of exactly one language.
	test necessity 'each', locale, verb('is of'), ['exactly', 'one'], language
	# 
	# Term:      region
	# Fact type: region is available in language
	# 	Term Form: region translation
	# 
	# Fact type: region translation has name
	#     Necessity: each region translation has exactly one name.
	# 
	# Term:      country
	# Fact type: country is available in language
	# 	Term Form: country translation
	# Fact type: country is of region
	# 	Necessity: each country is of exactly one region.
	# 
	# Fact type: country translation has name
	# 	Necessity: each country translation has exactly one name.
	# 
	# Term:      latitude
	# 	Concept Type: Real (Type)
	# 
	# Term:      longitude
	# 	Concept Type: Real (Type)
	# 
	# Term:      city
	# Fact type: city has latitude
	# 	Necessity: each city has exactly one latitude.
	# Fact type: city has longitude
	# 	Necessity: each city has exactly one longitude.
	# Fact type: city is available in language
	# 	Term Form: city translation
	# Fact type: city is of country
	# 	Necessity: each city is of exactly one country.
	# 
	# Fact type: city translation has name
	# 	Necessity: each city translation has exactly one name.
	# 
	# Term:      media type
	# 	Concept Type: Short Text (Type)
	# 
	# Term:      path
	# 	Concept Type: Short Text (Type)
	# 	Necessity: each path has a Length (Type) that is less than or equal to 100.
	# 
	# Term:      media
	# Fact type: media has path
	# 	Necessity: each media has exactly one path.
	# Fact type: media is available in language
	# 	Term Form: media translation
	# 
	# Term:      title
	# 	Concept Type: Short Text (Type)
	# 
	# Term:      description
	# 	Concept Type: Text (Type)
	# 	Necessity: each description has a Length (Type) that is less than or equal to 2000.
	# 
	# Fact type: media translation has title
	#     Necessity: each media translation has exactly one title.
	# Fact type: media translation has description
	#     Necessity: each media translation has exactly one description.
	# 
	# Term:      tour type
	# Fact type: tour type is available in language
	# 	Term Form: tour type translation
	# 
	# Fact type: tour type translation has name
	#     Necessity: each tour type translation has exactly one name.
	# 
	# Term:      keyword
	# 	Concept Type: Short Text (Type)
	# 	Necessity: each keyword has a Length (Type) that is less than or equal to 100.
	# 
	# Term:	   tour
	# Fact type: tour is of tour type
	#     Necessity: each tour is of exactly one tour type.
	# Fact type: tour has region
	#     Necessity: each tour has at least one region.
	# Fact type: tour has keyword
	# Fact type: tour has media
	# Fact type: tour is recommended
	# Fact type: tour is coming soon
	# Fact type: tour is hidden
	# Fact type: tour is honeymoon
	# Fact type: tour is available in language
	# 	Term Form: tour translation
	# 
	# Term:      comment
	# 	Concept Type: Text (Type)
	# 	Necessity: each comment has a Length (Type) that is less than or equal to 1000.
	# 
	# Fact type: tour translation has title
	#     Necessity: each tour translation has exactly one title.
	# Fact type: tour translation has description
	#     Necessity: each tour translation has exactly one description.
	# Fact type: tour translation has comment
	#     Necessity: each tour translation has exactly one comment.
	# 
	# Term:      duration in days
	# 	Concept Type: Integer (Type)
	# 
	# Term:      plan
	# Fact type: plan has duration in days
	# 	Necessity: each plan has exactly one duration in days.
	# Fact type: plan is of tour
	# 	Necessity: each plan is of exactly one tour.
	# 	Necessity: each tour has at least one plan.
	# 
	# Term:      departure date
	# 	Concept Type: Date (Type)
	# 
	# Term:      availability
	# 	Concept Type: Short Text (Type)
	# 	Definition: "no data" or "none" or "low" or "medium" or "high"
	# 
	# Term:      single price
	# 	Concept Type: Integer (Type)
	# 
	# Term:      double price
	# 	Concept Type: Integer (Type)
	# 
	# Term:      air fee
	# 	Concept Type: Integer (Type)
	# 
	# Term:      application
	# Fact type: application has departure date
	# 	Necessity: each application has exactly one departure date.
	# Fact type: application has availability
	# 	Necessity: each application has exactly one availability.
	# Fact type: application has single price
	# 	Necessity: each application has exactly one single price.
	# Fact type: application has double price
	# 	Necessity: each application has exactly one double price.
	# Fact type: application has air fee
	# 	Necessity: each application has exactly one air fee.
	# Fact type: application is hot offer
	# Fact type: application is of plan
	# 	Necessity: each application is of exactly one plan.
	# 	Necessity: each plan has at least one application.
	# Fact type: application is available in language
	# 	Term Form: application translation
	# 
	# Fact type: application translation has description
	# 	Necessity: each application translation has exactly one description.
	# 
	# Term:      overnights
	# 	Concept Type: Integer (Type)
	# 
	# Term:      order
	# 	Concept Type: Integer (Type)
	# 
	# Term:      itinerary
	# Fact type: itinerary has overnights
	# 	Necessity: each itinerary has exactly one overnights.
	# Fact type: itinerary has order
	# 	Necessity: each itinerary has exactly one order.
	# Fact type: itinerary is of city
	# 	Necessity: each itinerary is of exactly one city.
	# Fact type: itinerary is of plan
	# 	Necessity: each itinerary is of exactly one plan.
	# 
	# Term:      day number
	# 	Concept Type: Integer (Type)
	# 
	# Term:      location
	# 	Concept Type: Short Text (Type)
	# 	Necessity: each location has a Length (Type) that is less than or equal to 200.
	# 
	# Term:      story
	# Fact type: story has day number
	# 	Necessity: each story has exactly one day number.
	# Fact type: story is of plan
	# 	Necessity: each story is of exactly one plan.
	# Fact type: story is available in language
	# 	Term Form: story translation
	# 
	# Fact type: story translation has location
	#     Necessity: each story translation has exactly one location.
	# Fact type: story translation has description
	#     Necessity: each story translation has exactly one description.
	# 
	# Term:      requirement
	# 	Note: Things a traveller must do before travelling
	# Fact type: requirement is of tour
	# 	Necessity: each requirement is of exactly one tour.
	# Fact type: requirement is available in language
	# 	Term Form: requirement translation
	# 
	# Fact type: requirement translation has description
	#     Necessity: each requirement translation has exactly one description.
	# 
	# Term:      recommendation
	# 	Note: e.g. Malaria treatment
	# Fact type: recommendation is of tour
	# 	Necessity: each recommendation is of exactly one tour.
	# Fact type: recommendation is available in language
	# 	Term Form: recommendation translation
	# 
	# Fact type: recommendation translation has description
	#     Necessity: each recommendation translation has exactly one description.
	# 
	# Term:      url
	# 	Concept Type: Short Text (Type)
	# 
	# Term:      link category
	# Fact type: link category has name
	# 	Necessity: each link category has exactly one name.
	# 
	# Term:      link
	# Fact type: link has url
	# 	Necessity: each link has exactly one url.
	# Fact type: link has link category
	# Fact type: tour has link
	# Fact type: link is available in language
	# 	Term Form: link translation
	# 
	# Fact type: link translation has title
	#     Necessity: each link translation has exactly one title.
	# 
	# Term:      width
	# 	Concept Type: Integer (Type)
	# 
	# Term:      height
	# 	Concept Type: Integer (Type)
	# 
	# Term:      banner
	# Fact type: banner is of media
	# 	Necessity: each banner is of exactly one media.
	# Fact type: banner has url
	# 	Necessity: each banner has exactly one url.
	# Fact type: banner has width
	# 	Necessity: each banner has exactly one width.
	# Fact type: banner has height
	# 	Necessity: each banner has exactly one height.
	# Fact type: banner is enabled
	# Fact type: banner is available in language
	# 	Term Form: banner translation
	# 
	# Fact type: banner translation has title
	#     Necessity: each banner translation has exactly one title.
	# Fact type: banner translation has description
	#     Necessity: each banner translation has exactly one description.
	# 
	# Term:	   first name
	# 	Concept Type: Short Text (Type)
	#     Necessity: each first name has a Length (Type) that is less than or equal to 100.
	# 
	# Term:	   last name
	# 	Concept Type: Short Text (Type)
	#     Necessity: each last name has a Length (Type) that is less than or equal to 100.
	# 
	# Term:	   email
	# 	Concept Type: Short Text (Type)
	# 
	# Term:      subscriber
	# Fact type: subscriber has first name
	# 	Necessity: each subscriber has at most one first name.
	# Fact type: subscriber has last name
	# 	Necessity: each subscriber has at most one last name.
	# Fact type: subscriber has email
	# 	Necessity: each subscriber has exactly one email.
	# 
	# Term:      recipient group
	# Fact type: recipient group has name
	# 	Necessity: each recipient group has exactly one name.
	# Fact type: recipient group has subscriber
	# 
	# Term:      service
	# Fact Type: service has name
	# 	Necessity: each service has exactly one name.
	# Fact Type: service has language
	# 	Necessity: each service has exactly one language.
	# 
	# Fact type: tour includes service
	# 	term form: service inclusion
	# Fact type: service inclusion has order
	# 	Necessity: each service inclusion has exactly one order.
	# Fact type: service inclusion has description
	# 	Necessity: each service inclusion has exactly one description.
	# 
	# Fact type: tour excludes service
	# 	term form: service exclusion
	# Fact type: service exclusion has order
	# 	Necessity: each service exclusion has exactly one order.
	# Fact type: service exclusion has description
	# 	Necessity: each service exclusion has exactly one description.
	# 
	# Term:       option
	# Fact type:  option has name
	# 	Necessity: each option has exactly one name
	# 
	# Term:       site
	# Fact type:  site has name
	# 	Necessity: each site has exactly one name
	# Fact type:  site supports option in language
	# 	Term Form: site option
	# 
	# Term:       value
	# 	Concept Type: Short Text (Type)
	# 
	# Fact type:  site option has value
	# 	Necessity: each site option has exactly one value
	# 
	# Term:       page
	# Fact type: page is available in language
	# 	Term Form: page translation
	# 
	# Term:      body
	# 	Concept Type: Text (Type)
	# 	Necessity: each body has a Length (Type) that is less than or equal to 2000.
	# 
	# Fact type:  page translation has title
	# 	Necessity: each page translation has exactly one title
	# Fact type:  page translation has body
	# 	Necessity: each page translation has exactly one body