const
    util                                           = exports,
    assert                                         = require('@fua/core.assert'),
    is                                             = require('@fua/core.is'),
    path                                           = require('path'),
    {createReadStream}                             = require('fs'),
    fs                                             = require('fs/promises'),
    context                                        = require('@fua/resource.context'),
    {parseStream, serializeDataset, shaclValidate} = require('@fua/module.rdf'),
    {TermFactory, Dataset}                         = require('@fua/module.persistence'),
    defaultFactory                                 = new TermFactory(context),
    {glob: globSearch}                             = require('glob');

util.asyncMain = function (fn, ...args) {
    const resolve = () => process.exit(0);
    const reject  = (err) => {
        console.error(err?.stack ?? err);
        process.exit(1);
    };
    try {
        const result = fn.apply(null, args);
        if (result instanceof Promise) result.then(resolve).catch(reject);
        else resolve()
    } catch (err) {
        reject(err);
    }
};

util.collectFiles = async function (rootFolder, globPattern) {
    assert(is.string(rootFolder) && path.isAbsolute(rootFolder), 'expected rootFolder to be an absolute path string');
    assert(is.string(globPattern) || is.array.strings(globPattern), 'expected globPattern to be a string or array of strings');
    const folderStats = await fs.stat(rootFolder);
    assert(folderStats.isDirectory(), 'expected rootFolder to point to an existing directory');
    return await globSearch(globPattern, {
        cwd:      rootFolder,
        root:     rootFolder,
        nodir:    true,
        absolute: true,
        ignore:   'node_modules/**'
    });
};

util.globPattern = Object.freeze({
    triG:          '**/*.{trig}',
    nQuads:        '**/*.{nq,nquads}',
    turtle:        '**/*.{ttl,turtle}',
    nTriples:      '**/*.{nt,ntriples}',
    notation3:     '**/*.{n3}',
    jsonLD:        '**/*.{json,jsonld}',
    rdfXML:        '**/*.{rdf,rdfxml,owl}',
    shaclCompact:  '**/*.{shaclc,shc}',
    shaclExtended: '**/*.{shaclce,shce}'
});

util.fileFormat = Object.freeze({
    trig:     'application/trig',
    nq:       'application/n-quads',
    nquads:   'application/n-quads',
    ttl:      'text/turtle',
    turtle:   'text/turtle',
    nt:       'application/n-triples',
    ntriples: 'application/n-triples',
    n3:       'text/n3',
    json:     'application/ld+json',
    jsonld:   'application/ld+json',
    rdf:      'application/rdf+xml',
    rdfxml:   'application/rdf+xml',
    owl:      'application/rdf+xml',
    shaclc:   'text/shaclc',
    shc:      'text/shaclc',
    shaclce:  'text/shaclc-ext',
    shce:     'text/shaclc-ext'
});

util.readDataset = async function (ldFile) {
    assert(is.string(ldFile) && path.isAbsolute(ldFile), 'expected ldFile to be an absolute path string');
    const contentType = util.fileFormat[path.extname(ldFile).replace('.', '')];
    assert(contentType, 'unknown file extension or unsupported content type');
    const fileStats = await fs.stat(ldFile);
    assert(fileStats.isFile(), 'expected ldFile to point to an existing file');
    const
        textStream = createReadStream(ldFile),
        quadStream = parseStream(textStream, contentType, defaultFactory),
        dataset    = new Dataset(null, defaultFactory);
    await dataset.addStream(quadStream);
    return dataset;
};

util.writeDataset = async function (ldFile, dataset) {
    assert(is.string(ldFile) && path.isAbsolute(ldFile), 'expected ldFile to be an absolute path string');
    const contentType = util.fileFormat[path.extname(ldFile).replace('.', '')];
    assert(contentType, 'unknown file extension or unsupported content type');
    const result = await serializeDataset(dataset, contentType);
    await fs.writeFile(ldFile, result);
};

util.mergeDatasets = function (datasets) {
    assert(is.array(datasets) && datasets.length > 0, 'expected datasets to be an array with at least 1 dataset');
    assert(datasets.every(dataset => dataset instanceof Dataset), 'expected all datasets to be an instance of Dataset');
    const output = new Dataset(null, datasets[0].factory);
    for (let input of datasets) output.add(input);
    return output;
};

Object.freeze(util);
module.exports = util;
