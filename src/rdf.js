const
    RDF         = exports,
    _RDF        = Object.create(null),
    assert      = require('@nrd/fua.core.assert'),
    is          = require('@nrd/fua.core.is'),
    context     = require('@nrd/fua.resource.context'),
    rdf         = require('@nrd/fua.module.rdf'),
    persistence = require('@nrd/fua.module.persistence'),
    {glob}      = require('glob');
