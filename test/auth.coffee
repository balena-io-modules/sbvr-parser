typeVocab = require('fs').readFileSync(require.resolve('@resin/sbvr-types/Type.sbvr'))
test = require('./test')(typeVocab)
_ = require 'lodash'
{ vocabulary, term, verb, factType, conceptType, referenceScheme, vocabNecessity } = require('./sbvr-helper')
necessity = _.partial(vocabNecessity, 'Auth')

shortTextType = term 'Short Text', 'Type'
hashedType = term 'Hashed', 'Type'

key = term 'key', 'Auth'
username = term 'username', 'Auth'
name = term 'name', 'Auth'
password = term 'password', 'Auth'
permission = term 'permission', 'Auth'
role = term 'role', 'Auth'
user = term 'user', 'Auth'
actor = term 'actor', 'Auth'
apiKey = term 'api key', 'Auth'

has = verb('has')

describe 'Auth', ->
	# Vocabulary: Auth
	test vocabulary 'Auth'
	# Term:       username
	test username
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# Term:       password
	test password
	# 	Concept Type: Hashed (Type)
	test conceptType hashedType
	# Term:       name
	test name
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType
	# Term:       key
	test key
	# 	Concept Type: Short Text (Type)
	test conceptType shortTextType

	# Term:       permission
	test permission
	# 	Reference Scheme: name
	test referenceScheme name
	# Fact type:  permission has name
	test factType permission, has, name
	# 	Necessity: Each permission has exactly one name.
	test necessity 'each', permission, has, ['exactly', 'one'], name
	# 	Necessity: Each name is of exactly one permission.
	test necessity 'each', name, verb('is of'), ['exactly', 'one'], permission

	# Term:       role
	test role
	# 	Reference Scheme: name
	test referenceScheme name
	# Fact type:  role has name
	test factType role, has, name
	# 	Necessity: Each role has exactly one name.
	test necessity 'each', role, has, ['exactly', 'one'], name
	# 	Necessity: Each name is of exactly one role.
	test necessity 'each', name, verb('is of'), ['exactly', 'one'], role
	# Fact type:  role has permission
	test factType role, has, permission

	# Term:       actor
	test actor

	# Term:       user
	test user
	# 	Reference Scheme: username
	test referenceScheme username
	# 	Concept Type: actor
	test conceptType actor
	# Fact type:  user has username
	test factType user, has, username
	# 	Necessity: Each user has exactly one username.
	test necessity 'each', user, has, ['exactly', 'one'], username
	# 	Necessity: Each username is of exactly one user.
	test necessity 'each', username, verb('is of'), ['exactly', 'one'], user
	# Fact type:  user has password
	test factType user, has, password
	# 	Necessity: Each user has exactly one password.
	test necessity 'each', user, has, ['exactly', 'one'], password
	# Fact type:  user has role
	test factType user, has, role
	# 	Note: A 'user' will inherit all the 'permissions' that the 'role' has.
	# Fact type:  user has permission
	test factType user, has, permission

	# Term:       api key
	test apiKey
		# Reference Scheme: key
	test referenceScheme key
	# Fact type:  api key has key
	test factType apiKey, has, key
	# 	Necessity: each api key has exactly one key
	test necessity 'each', apiKey, has, ['exactly', 'one'], key
	# 	Necessity: each key is of exactly one api key
	test necessity 'each', key, verb('is of'), ['exactly', 'one'], apiKey
	# Fact type:  api key has role
	test factType apiKey, has, role
		# Note: An 'api key' will inherit all the 'permissions' that the 'role' has.
	# Fact type:  api key has permission
	test factType apiKey, has, permission
	# Fact type:  api key is of actor
	test factType apiKey, verb('is of'), actor
	# 	Necessity: each api key is of exactly one actor
	test necessity 'each', apiKey, verb('is of'), ['exactly', 'one'], actor
