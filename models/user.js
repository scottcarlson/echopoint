/**
 * User Model
 */

// Module dependencies
var Auth = require('../server/auth').getInstance();
    
var UserModel = {

  Architecture: {
    schema: {
      // id is really only used as a unique identifier for firebase
      id: {type: String, sparse: true, unique: true },
      name: {type: String},
      email: {type: String, required: true, index: true, unique: true },
      password: {type: String, required: true},
      role: {type: String, required: true, default: 'user' }, // current roles: admin, user
      Business: [{
        id: {type: String, sparse: true, unique: true },
        name: { type: String, required: true},
        Analytics: {
          id: {type: String, required: true}
        },
        Social: {
          facebook: {
            id: {type: String},
            auth: {
              oauthAccessToken: {type: String},
              expires: {type: Number},
              created: {type: Number}
            },

            account: {
              id: {type: String},
              oauthAccessToken: {type: String},
              populated: {type: Boolean, default: false},
              data: {}
            },

            notifications: {
              count: {type: Number, default: 0}, // this is the array length of analytic data last time user checked notification updates, if Analytic.facebook array length is larger than we have updates
              timestamp: {type: Number, default: 0} // this is the timestamp of the last analytic data that a user was updated about, we are using the timestamp as an ID 
            }
          },
          twitter: {
            id: {type: String},
            username: {type: String},
            populated: {type: Boolean, default: false},
            auth: {  
              oauthAccessToken: {type: String},
              oauthAccessTokenSecret: {type: String},
              expires: {type: Number},
              created: {type: Number}
            },
            queries: {},
            notifications: {
              mentions: {
                count: {type: Number, default: 0}, // this is the array length of analytic data last time user checked notification updates, if Analytic.facebook array length is larger than we have updates
                since_id: {type: String, default: '0'}, // this is the timestamp of the last analytic data that a user was updated about, we are using the timestamp as an ID
                last_checked: {type: Number} // timestamp
              },
              retweets: {
                count: {type: Number, default: 0}, // this is the array length of analytic data last time user checked notification updates, if Analytic.facebook array length is larger than we have updates
                since_id: {type: String, default: '0'}, // this is the timestamp of the last analytic data that a user was updated about, we are using the timestamp as an ID
                last_checked: {type: Number} // timestamp
              },
              messages: {
                count: {type: Number, default: 0}, // this is the array length of analytic data last time user checked notification updates, if Analytic.facebook array length is larger than we have updates
                since_id: {type: String, default: '0'}, // this is the timestamp of the last analytic data that a user was updated about, we are using the timestamp as an ID
                last_checked: {type: Number} // timestamp              
              },
              search: {
                count: {type: Number, default: 0}, // this is the array length of analytic data last time user checked notification updates, if Analytic.facebook array length is larger than we have updates
                since_id: {type: String, default: '0'}, // this is the timestamp of the last analytic data that a user was updated about, we are using the timestamp as an ID
                last_checked: {type: Number} // timestamp
              }
            }
          },
          
          foursquare: {
            id: {type: String},
            auth: {
              oauthAccessToken: {type: String},
              created: {type: Number}
            },
            venue: {
              id: {type: String},
              name: {type: String},
              populated: {type: Boolean, default: false},
              data: {}
            }
          },
          
          google: {
            id: {type: String},
            auth: {
              oauthAccessToken: {type: String},
              oauthRefreshToken: {type: String},
              idToken: {type: String}, 
              expires: {type: Number},
              created: {type: Number}
            },
            user: {
              id: {type: String},
              data: {}
            },
            plus: {
              id: {type: String},
              populated: {type: Boolean, default: false},
              //data: {},
              update: {
                timestamp: {type: Number, default: 0} // this is the last plus api call time
              }
            },
            places: {
              id: {type: String},
              //pageId: {type: String}, // places have a seperate G+ page (with a seperate ID) that only includes reviews and basic business info... it's very confusing 
              reference: {type: String},
              populated: {type: Boolean, default: false},
              //data: {},
              update: {
                timestamp: {type: Number, default: 0} // this is the last places/maps api call time
              }
            },  
            reviews: {
              //scraped: {type: Boolean, default: false},
              timestamp: {type: Number, default: 0}, // this is the last reviews web scrape
              //override: {type: Boolean, default: false} // this marks if the the rating changed and we need to call reviews before the 24 hour check
            }
          },

          yelp: {
            id: {type: String},
            //populated: {type: Boolean, default: false},
            /*auth: {
              consumerKey: {type: String},
              consumerSecret: {type: String},
              oauthAccessToken: {type: String},
              oauthAccessTokenSecret: {type: String}
            },
            business: {},*/
            update: {
              //scraped: { type: Boolean, default: false},
              timestamp: {type: Number, default: 0} // this is the last api call time
            }
          },
          instagram: {
            id: {type: String},
            auth: {
              oauthAccessToken: {type: String},
              expires: {type: Number},
              created: {type: Number}
            }
          }
        },
        Tools: {
          bitly: {
            id: {type: String},
            auth: {
              login: {type: String},
              oauthAccessToken: {type: String},
              expires: {type: Number},
              created: {type: Number}
            }
          },
        }            
      }],
      
      meta: {
        created: { type: Number, default: Date.now() },
        Business: { 
          tokens: { type: Number, default: 1 },
          current: { 
            id: { type: String, default: null },
            bid: { type: String, default: '' },
            index: { type: Number, default: 0 }
          }
        },
        guide: { type: Boolean, default: 1}
      }   
    },

    options: {
      // autoIndex should be false in production (http://mongoosejs.com/docs/guide.html#indexes)
      autoIndex: true
    },
    associations: {
      hasOne: [],
      hasMany: [],
      notNested: {}
    }  
  },

  Middleware: {
    // http://mongoosejs.com/docs/middleware.html
    pre: {
      save: function(next) {
        var user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        Auth.encrypt(user.password, function(err, encrypted){
          if (err) return next(err);
          user.password = encrypted;
          next();
        });
      }
    },
    post: {}
  },

  Custom: {
    // http://mongoosejs.com/docs/guide.html
    methods: {
      authenticate: function(unverified, callback) {
        Auth.authenticate(unverified, this.password, function(err, match){
          if (err) callback(err)
          callback(null, match)
        });
      },
      getBusinessIndex: function(business_id, callback) {
        for(var i=0,l=this.Business.length;i<l;i++) {
          var index = i;
          if(this.Business[i]._id.toString() === business_id.toString())
            return callback(null, index);
        }

        callback('No matching business')
      }
    },

    statics: {
      findByName: function(name, callback) {
        this.find({name: new RegExp(name, 'i')}, callback);
      },
      getUserBusinessIndex: function(user_id, business_id, callback) {      
        this.findById(user_id, function(err, user) {
          if(err)
            return callback(err)

          for(var i=0,l=user.Business.length;i<l;i++) {
            var index = i;
            if(user.Business[i]._id.toString() === business_id.toString())
              return callback(err, user, index);
          }

          callback('No matching business')
        })
      }
    },

    virtuals: {
      
      "name.email": {
        get: function() {
          return this.name + ' (' + this.email + ')';
        },
        set: function(data) {
           this.name = data.name;
          this.email = data.email;
        }
      }
    }
  }
};


module.exports = UserModel;