"use strict";

/**
 * @module csv2gexf
 * @author Wouter Van den Broeck
 * @copyright 2016
 */

const fs    = require('fs');
const path  = require('path');

const csv   = require('csv');
const gexf  = require('gexf');

const utils = require('./utils');

// -------------------------------------------------------------------------------------------------
// Config documentation:

/**
 * @typedef {Object} config - The options object for the convert method.
 * @property {graphParams} graphParams - The parameters object that is passed to the `gexf.create`
 *          method.
 * @property {nodesConfig} nodes - The options for processing the nodes CSV document.
 * @property {edgesConfig} edges - The options for processing the edges CSV document.
 * @property {string} [saveAs] - Optional. The path of the GEXF file to save the result in.
 * @see convert
 */

/**
 * @typedef {Object} graphParams - The parameters object that is passed to the `gexf.create` method.
 *          Some of these parameters are specified below. Consult the
 *          {@link https://www.npmjs.com/package/gexf#instantiation Gexf documentation} for the
 *          other potential parameters. Note that you should not provide a _model_ as this is
 *          derived from the _nodeSchema_ and _edgeSchema_ objects.
 * @property {string} [defaultEdgeType] - The type for all edges when there is no _type_ in the
 *          edge schema. The type must be either `directed`, `undirected` or `mutual`.
 * @property {metadata} [meta] - Provides additional information about the graph.
 */

/**
 * @typedef {Object} metadata - Provides additional information about the graph. It can specify
 *          the _lastmodifieddate_ or any additional arbitrary property. The values must be
 *          strings. Each arbitrary property is added as an child element in the `meta`
 *          element in the _gexf_ document. The property's name is used as element name and
 *          the value as the element's innerHtml.
 * @property {string} [lastmodifieddate] - A date formatted as an international standard
 *          date (yyyy-mm-dd), e.g. `'2009−03−20'`. Sets the value of the `lastmodifieddate`
 *          attribute of the `meta` element in the _gexf_ document.
 */

/**
 * @typedef {Object} nodesConfig - The options for processing the nodes CSV document.
 * @property {string} file - The path to the nodes CSV file.
 * @property {nodeSchema} nodeSchema - Specifies the column types.
 * @property {parseOptions} parseOptions - The options passed to the `csv.parse` function.
 */

/**
 * @typedef {Object} edgesConfig - The options for processing the edges CSV document.
 * @property {string} file - The path to the nodes CSV file.
 * @property {edgeSchema} edgeSchema - Specifies the column types.
 * @property {parseOptions} parseOptions - The options passed to the `csv.parse` function.
 */

/**
 * @typedef {nodeSchemaEl[]} nodeSchema - An array of type specifications. There should be one type
 *          specifications string for each column.
 */

/**
 * @typedef {string|nodeSchemaObj} nodeSchemaEl - Must either be one of the following strings or a
 *          schema element object.<br>
 * The valid type strings are:
 * <ul>
 *   <li>`id` - There must be one _id_ column that contains string values used as
 *     node id.</li>
 *   <li>`label` - Optional. There may be one _label_ column. The corresponding
 *     column must contain string values. These values are used as the label of the respective node.
 *     If the schema does not specify a label, then the node ids are also used as the node
 *     labels.</li>
 * </ul>
 */

/**
 * @typedef {Object} nodeSchemaObj - Specifies an attribute or viz element in the node schemas.
 *
 * @property {string} target - The target is either `attributes` or `viz`.
 *
 * <p>The _target_ determines which _id_ and _type_ values you may provide.<br>
 *
 * When the _target_ is `attributes` then the _id_ and _title_ can
 * be any string and the _type_ must be one of:
 * <ul>
 *   <li>`string` - An attribute of type string.</li>
 *   <li>`integer` - The values in the corresponding column are parsed using `parseInt`.</li>
 *   <li>`float` - The values in the corresponding column are parsed using `parseFloat`.</li>
 *   <li>`boolean` - True when the value is either `true` (case-insensitive)
 *     or `1`, and false for all other values.</li>
 * </ul>
 *
 * <p>When the _target_ is `viz` then the _id_ must be either
 * `color`, `size` or `shape`. The type
 * is implied by the _id_ and is thus ignored. The values are to be given as follows:
 * <ul>
 *   <li>`color`: The RGB values expressed like `rgb(255,204,0)`.</li>
 *   <li>`size`: A number that determines the scale. Default is 1.0.</li>
 *   <li>`shape`: Either `disc`, `square`, `triangle`,
 *     or `diamond`</li>.
 * </ul></p>
 *
 * @property {string} [id] - Optional. The id of the attribute or viz setting. When the id is not
 *          given for an attribute, then the header of the corresponding column in the CSV file is
 *          used.
 *
 * @property {string} [title] - Optional. The title of the attribute. When the title is not given,
 *          then the _id_ is used.
 *
 * @property {string} type - The type of the value.
 */

/**
 * @typedef {edgeSchemaEl[]} edgeSchema - An array of type specifications. There should be one type
 *          specifications string for each column.
 */

/**
 * @typedef {string|edgeSchemaObj} edgeSchemaEl - Must either be one of the following strings or a
 *          schema element object.<br>
 * The valid type strings are:
 * <ul>
 *   <li>`id` - Optional. There may be one _id_ column that contains string values used as node id.
 *          If the schema does not specify an _id_, then the ids of the nodes are automatically
 *          generated.
 *   <li>`type` - Optional. There may be one _type_ column.
 *     The values in the corresponding column must be either 'directed', 'undirected' or 'mutual'.
 *     If the schema does not specify a _type_, then the edge type is the value for
 *     `parseOptions.defaultEdgeType`.
 *   <li>`label` - Optional. There may be one _label_ column. The corresponding column must contain
 *          string values. These values are used as the label of the respective edge. If the
 *          schema does not specify a label, then the edge ids are also used as the edge labels.
 *   <li>`source` - There must be one _source_ column that contains the ids of the edges' source nodes.
 *   <li>`target` - There must be one _target_ column that contains the ids of the edges' target nodes.
 *   <li>`weight` - Optional. There may be one _weight_ column which contains numerical values which are
 *          set as `weight` on the edges.
 * </ul>
 */

/**
 * @typedef {Object} edgeSchemaObj - Specifies an attribute or viz element in the edge schemas.
 *
 * @property {string} target - The target is either `attributes` or `viz`.
 *
 *
 * <p>The _target_ determines which _id_ and _type_ values you may provide.<br>
 *
 * When the _target_ is `attributes` then the _id_ and _title_ can
 * be any string and the _type_ must be one of:
 * <ul>
 *   <li>`string` - An attribute of type string.</li>
 *   <li>`integer` - The values in the corresponding column are parsed using `parseInt`.</li>
 *   <li>`float` - The values in the corresponding column are parsed using `parseFloat`.</li>
 *   <li>`boolean` - True when the value is either `true` (case-insensitive)
 *     or `1`, and false for all other values.</li>
 * </ul>
 *
 * <p>When the _target_ is `viz` then the _id_ must be either
 * `color`, `thickness` or `shape`. The type
 * is implied by the _id_ and is thus ignored. The values are to be given as follows:
 * <ul>
 *   <li>`color`: The RGB values expressed like `rgb(255,204,0)`.</li>
 *   <li>`thickness`: A number. The default is 1.0.</li>
 *   <li>`shape`: Either `solid`, `dotted`, `dashed`,
 *     or `double`.</li>
 * </ul></p>
 *
 * @property {string} [id] - Optional. The id of the attribute or viz setting. When the id is not
 *          given for an attribute, then the header of the corresponding column in the CSV file is
 *          used.
 *
 * @property {string} [title] - Optional. The title of the attribute. When the title is not given,
 *          then the _id_ is used.
 *
 * @property {string} [type] - The type of the value.
 */

/**
 * @typedef {Object} parseOptions - The options passed to the `csv.parse` function.
 * @see {@link http://csv.adaltas.com/parse/}.
 */

// -------------------------------------------------------------------------------------------------
// Exported convert function:

/**
 * Returns a promise that converts the data in the given CSV documents to a GEXF document. When
 * `config.saveAs` is provided then this promise resolves to the path of the resulting GEXF file,
 * else it resolves to the resulting Gexf object.
 * @param {config} config - The configuration object.
 * @returns {Promise}
 * @public
 */
exports.convert = function (config) {
    var nodeRecords;
    var edgeRecords;

    return loadCSV(config.nodes, true)
        .then(function (records) {
            nodeRecords = records;
            return loadCSV(config.edges, false);
        })
        .then(function (records) {
            //console.log(records);
            edgeRecords = records;
            return createGexf(nodeRecords, edgeRecords, config);
        })
        .then(function (gexfObj) {
            if (config.saveAs != undefined) {
                return saveGexf(gexfObj, config.saveAs);
            }
            else { return Promise.resolve(gexfObj); }
        })
        .catch(function (err) {
            console.error(err);
            throw err;
        });
};

// -------------------------------------------------------------------------------------------------
// CSV Loading and parsing:

/*
 * Returns a promise that loads the data from the CSV file specified in the given configuration
 * object, checks the schema, parses the values, and resolves to the resulting records, which is
 * an array of objects.
 * @param {nodesConfig|edgesConfig} config - The configuration object.
 * @param {boolean} isNodeSchema - True when the given the node schema, or false when given the
 *          edge schema.
 * @returns {Promise}
 * @private
 */
function loadCSV(config, isNodeSchema) {
    return new Promise(function (resolve, reject) {

        // read the csv file:
        var file = path.resolve(config.file);
        fs.readFile(file, (err, data) => {
            if (err) { return reject(`Failed to read ${file}. ${err}`); }

            // parse the csv data:
            var parseOptions = config.parseOptions;
            parseOptions.columns = true;
            csv.parse(data, parseOptions, function (err, records) {
                if (err) { return reject(`Failed to parse the csv data in ${file}. ${err}`); }

                try {
                    checkSchema(records, config.schema, isNodeSchema);
                    parseValues(records, config.schema, isNodeSchema);
                    resolve(records);
                }
                catch (err) { reject(err); }
            });
        });
    });
}

/*
 * Checks whether the given schema respects the constraints and throws an error if it doesn't.
 * @param {array} records - A array of objects, of for each record.
 * @param {nodeSchema|edgeSchema} schema - The schema to check.
 * @param {boolean} isNodeSchema - True when the given the node schema, or false when given the
 *          edge schema.
 * @private
 */
function checkSchema(records, schema, isNodeSchema) {
    var ctxt = `in the ${isNodeSchema ? 'node' : 'edge'} schema`;

    // Check if there is one schema element for each column:
    var headers = Object.keys(records[0]);
    if (headers.length != schema.length) {
        throw new Error(`There are ${headers.length} columns and ${schema.length} schema elements`
            + ` ${ctxt}. These numbers should be equal.`);
    }

    // Check if the required schema elements are present:
    if (isNodeSchema) {
        if (schema.indexOf('id') < 0) {
            throw new Error(`There is no 'id' ${ctxt}.`);
        }
    }
    else {  // edge schema:
        if (schema.indexOf('source') < 0) {
            throw new Error(`There is no 'source' ${ctxt}.`);
        }
        if (schema.indexOf('target') < 0) {
            throw new Error(`There is no 'target' ${ctxt}.`);
        }
    }

    for (var coli = 0; coli < headers.length; coli++) {
        var spec = schema[coli];
        var header = headers[coli];
        var nodeStringSpecs = [ 'id', 'label' ];
        var edgeStringSpecs = [ 'id', 'label', 'source', 'target', 'type', 'weight' ];
        var attributeTypes = [ 'string', 'integer', 'float', 'boolean' ];
        var nodeVizIds = [ 'color', 'size', 'shape' ];
        var edgeVizIds = [ 'color', 'thickness', 'shape' ];

        if (typeof spec == 'string') {
            if (isNodeSchema && nodeStringSpecs.indexOf(spec) < 0) {
                throw new Error(`Unexpected node schema element '${spec}' ${ctxt}.`);
            }
            if (!isNodeSchema && edgeStringSpecs.indexOf(spec) < 0) {
                throw new Error(`Unexpected edge schema element '${spec}' ${ctxt}.`);
            }
        }
        else if (typeof spec != 'object') {
            throw new Error(`A schema element must be either a string or an object, got '${spec}' of type ${typeof spec} ${ctxt}`);
        }
        else if (spec.target == 'attributes') {
            if (spec.id === undefined) { spec.id = header; }
            if (spec.title === undefined) { spec.title = spec.id; }
            if (attributeTypes.indexOf(spec.type) < 0) {
                throw new Error(`Unexpected type '${spec.type}' in the 'attributes' schema element`
                    + ` with id '${spec.id}' ${ctxt}.`);
            }
        }
        else if (spec.target == 'viz') {
            if (isNodeSchema) {
                if (nodeVizIds.indexOf(spec.id) < 0) {
                    throw new Error(`Unexpected id '${spec.id}' for a 'viz' element ${ctxt}.`);
                }
            }
            else {
                if (spec.id === undefined) {
                    throw new Error(`The id is missing for a 'viz' element ${ctxt}.`);
                }
                if (edgeVizIds.indexOf(spec.id) < 0) {
                    throw new Error(`Unexpected id '${spec.id}' for a 'viz' element ${ctxt}.`);
                }
            }
        }
        else { throw new Error(`Unexpected target '${spec.target}' ${ctxt}`); }
    }
}

/*
 * Parse the non-strings values in the records.
 * @param {array} records - A array of objects, of for each record.
 * @param {Object} schema - The schema object.
 * @param {boolean} isNodeSchema - True when the given the node schema, or false when given the
 *          edge schema.
 * @returns {array} records
 */
function parseValues(records, schema, isNodeSchema) {
    var headers = Object.keys(records[0]);

    // Parse the value when needed:
    for (var coli = 0; coli < headers.length; coli++) {
        var spec = schema[coli];
        var header = headers[coli];
        var edgeTypes = [ 'directed', 'undirected', 'mutual' ];
        var nodeShapes = [ 'disc', 'square', 'triangle', 'diamond' ];
        var edgeShapes = [ 'solid', 'dotted', 'dashed', 'double' ];

        if (typeof spec == 'string') {
            if (spec == 'weight') { parseColumn(records, header, parseFloat); }
            else if (spec == 'type') {
                assertColumn(records, header, function (value) {
                    if (edgeTypes.indexOf(value) < 0) {
                        throw new Error(`Unexpected type '${value}' in column '${header}' ${ctxt}.`);
                    }
                });
            }
        }
        else if (spec.target = 'attributes') {
            if (spec.type == 'integer') { parseColumn(records, header, parseInt); }
            else if (spec.type == 'float') { parseColumn(records, header, parseFloat); }
            else if (spec.type == 'boolean') { parseColumn(records, header, parseBoolean); }
        }
        else if (spec.target = 'viz') {
            if (isNodeSchema) {
                if (spec.id == 'size') { parseColumn(records, header, parseFloat); }
                else if (spec.id == 'shape') {
                    assertColumn(records, header, function (value) {
                        if (nodeShapes.indexOf(value) < 0) {
                            throw new Error(`Unexpected shape '${value}' in column '${header}' ${ctxt}.`);
                        }
                    });
                }
            }
            else {
                if (spec.id == 'size') { parseColumn(records, header, parseFloat); }
                else if (spec.id == 'shape') {
                    assertColumn(records, header, function (value) {
                        if (edgeShapes.indexOf(value) < 0) {
                            throw new Error(`Unexpected value '${value}' in column '${header}'.`);
                        }
                    });
                }
            }
        }
    }
    return records;
}

function parseBoolean(val) {
    return val.toUpperCase() == 'TRUE' || val == '1';
}

function parseColumn(records, header, parseFn) {
    for (var reci = 0; reci < records.length; reci++) {
        var record = records[reci];
        record[header] = parseFn(record[header]);
    }
}

function assertColumn(records, header, assertFn) {
    for (var reci = 0; reci < records.length; reci++) {
        assertFn(records[reci]);
    }
}

// -------------------------------------------------------------------------------------------------
// GEXF construction:

/*
 * Returns a promise the creates, populates and resolves to the Gexf object.
 * @param nodeRecords
 * @param edgeRecords
 * @param config
 * @returns {Promise}
 */
function createGexf(nodeRecords, edgeRecords, config) {
    return new Promise(function (resolve, reject) {

        // Derive the model:
        config.graphParams.model = {
            node: deriveModel(config.nodes.schema),
            edge: deriveModel(config.edges.schema)
        };

        // Create the gexf object:
        try {
            var gexfObj = gexf.create(config.graphParams);
            addNodes(gexfObj, nodeRecords, config.nodes);
            addEdges(gexfObj, edgeRecords, config.edges);
        }
        catch (err) {
            console.error(err.stack);
            reject(err);
        }

        resolve(gexfObj);
    });
}

function deriveModel(schema) {
    var model = [];
    for (var spec of schema) {
        if (typeof spec == 'object' && spec.target == 'attributes') {
            model.push({
                id: spec.id,
                type: spec.type,
                title: spec.title
            });
        }
    }
    return model;
}

function addNodes(gexfObj, records, config) {
    var headers = Object.keys(records[0]);
    for (var reci = 0; reci < records.length; reci++) {
        var record = records[reci];
        var node = {
            id: undefined,
            label: undefined
        };
        for (var coli = 0; coli < headers.length; coli++) {
            var schema = config.schema[coli];
            var header = headers[coli];
            var value = record[header];

            if (typeof schema == 'string') {
                if (schema == 'id') { node.id = value; }
                else if (schema == 'label') { node.label = value; }
            }
            else if (schema.target == 'attributes') {
                if (node.attributes === undefined) { node.attributes = {}; }
                node.attributes[schema.id] = value;
            }
            else if (schema.target == 'viz') {
                if (node.viz === undefined) { node.viz = {}; }
                node.viz[schema.id] = value;
            }
        }

        // Add default values:
        if (node.label === undefined) { node.label = id; }

        gexfObj.addNode(node);
    }
}

function addEdges(gexfObj, records, config) {
    var headers = Object.keys(records[0]);
    var idi = 1;
    for (var reci = 0; reci < records.length; reci++) {
        var record = records[reci];
        var edge = {
            id: undefined,
            label: undefined,
            source: undefined,
            target: undefined
        };
        for (var coli = 0; coli < headers.length; coli++) {
            var schema = config.schema[coli];
            var header = headers[coli];
            var value = record[header];

            if (typeof schema == 'string') {
                if (schema == 'id') { edge.id = value; }
                else if (schema == 'label') { edge.label = value; }
                else if (schema == 'type') { edge.type = value; }
                else if (schema == 'source') { edge.source = value; }
                else if (schema == 'target') { edge.target = value; }
                else if (schema == 'weight') { edge.weight = value; }
            }
            else if (schema.target == 'attributes') {
                if (edge.attributes === undefined) { edge.attributes = {}; }
                edge.attributes[schema.id] = value;
            }
            else if (schema.target == 'viz') {
                if (edge.viz === undefined) { edge.viz = {}; }
                edge.viz[schema.id] = value;
            }
        }

        // Add default values:
        if (edge.id === undefined) { edge.id = `e${idi++}`; }
        if (edge.label === undefined) { edge.label = edge.id; }

        gexfObj.addEdge(edge);
    }
}

// -------------------------------------------------------------------------------------------------
// Saving

/*
 * Returns a promise that save the given Gexf object in the file on the given path and resolves to
 * the given Gefx object.
 * @param gexfObj
 * @param [string} path
 * @returns {Promise}
 */
function saveGexf(gexfObj, path) {
    return new Promise(function (resolve, reject) {
        var string = utils.formatXml(gexfObj.serialize());
        fs.writeFile(path, string, function (err) {
            if (err) { return reject('Failed to save the Gexf file. ${err}'); }
            resolve(gexfObj);
        });
    });
}
