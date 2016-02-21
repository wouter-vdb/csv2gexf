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
 * @property {graphParams} graphParams - The options passed to the {@link gexf.create} method.
 * @property {nodesConfig} nodes - The options for processing the nodes CSV document.
 * @property {edgesConfig} edges - The options for processing the edges CSV document.
 * @property {string} [saveAs] - Optional. The path of the GEXF file to save the result in.
 * @see convert
 */

/**
 * @typedef {Object} graphParams - The parameters passed to the {@link gexf.create} method. Some
 *          of these parameters are specified below. The other potential parameters are specified
 *          in {@link https://www.npmjs.com/package/gexf#instantiation this document}. Note that
 *          you should not provide a <em>model</em> as this is derived from the {@link edgeSchema}
 *          and {@link edgeSchema} objects.
 * @property {string} [defaultEdgeType] - The type for all edges when there is no <em>type</em> in the
 *          edge schema. The type must be either 'directed', 'undirected' or 'mutual'.
 * @property {metadata} [meta] - Provides additional information about the graph.
 */

/**
 * @typedef {Object} metadata - Provides additional information about the graph. It can specify
 *          the <em>lastmodifieddate</em> or any additional arbitrary property. The values must be
 *          strings. Each arbitrary property is added as an child element in the <code>meta</code>
 *          element in the <em>gexf</em> document. The property's name is used as element name and
 *          the value as the element's innerHtml.
 * @property {string} [lastmodifieddate] - A date formatted as an international standard
 *          date (yyyy-mm-dd), e.g. `'2009−03−20'`. Sets the value of the <code>lastmodifieddate</code>
 *          attribute of the <code>meta</code> element in the <em>gexf</em> document.
 */

/**
 * @typedef {Object} nodesConfig - The options for processing the nodes CSV document.
 * @property {string} file - The path to the nodes CSV file.
 * @property {nodeSchema} nodeSchema - Specifies the column types.
 * @property {parseOptions} parseOptions - The options passed to the {@link csv.parse} function.
 */

/**
 * @typedef {Object} edgesConfig - The options for processing the edges CSV document.
 * @property {string} file - The path to the nodes CSV file.
 * @property {edgeSchema} edgeSchema - Specifies the column types.
 * @property {parseOptions} parseOptions - The options passed to the {@link csv.parse} function.
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
 *   <li><code>id</code> - There must be one <em>id</em> column that contains string values used as
 *     node id.</li>
 *   <li><code>label</code> - Optional. There may be one <em>label</em> column. The corresponding
 *     column must contain string values. These values are used as the label of the respective node.
 *     If the schema does not specify a label, then the node ids are also used as the node
 *     labels.</li>
 * </ul>
 */

/**
 * @typedef {Object} nodeSchemaObj - Specifies an attribute or viz element in the node schemas.
 *
 * @property {string} target - The target is either <code>attributes</code> or <code>viz</code>.
 *
 * <p>The <em>target</em> determines which <em>id</em> and <em>type</em> values you may provide.<br>
 *
 * When the <em>target</em> is <code>attributes</code> then the <em>id</em> and <em>title</em> can
 * be any string and the <em>type</em> must be one of:
 * <ul>
 *   <li><code>string</code> - An attribute of type string.</li>
 *   <li><code>integer</code> - The values in the corresponding column are parsed using {@link parseInt}.</li>
 *   <li><code>float</code> - The values in the corresponding column are parsed using {@link parseFloat}.</li>
 *   <li><code>boolean</code> - True when the value is either <code>true</code> (case-insensitive)
 *     or <code>1</code>, and false for all other values.</li>
 * </ul>
 *
 * <p>When the <em>target</em> is <code>viz</code> then the <em>id</em> must be either
 * <code>color</code>, <code>size</code> or <code>shape</code>. The type
 * is implied by the <em>id</em> and is thus ignored. The values are to be given as follows:
 * <ul>
 *   <li><code>color</code>: The RGB values expressed like <code>rgb(255,204,0)</code>.</li>
 *   <li><code>size</code>: A number that determines the scale. Default is 1.0.</li>
 *   <li><code>shape</code>: Either <code>disc</code>, <code>square</code>, <code>triangle</code>,
 *     or <code>diamond</code></li>.
 * </ul></p>
 *
 * @property {string} [id] - Optional. The id of the attribute or viz setting. When the id is not
 *          given for an attribute, then the header of the corresponding column in the CSV file is
 *          used.
 *
 * @property {string} [title] - Optional. The title of the attribute. When the title is not given,
 *          then the <em>id</em> is used.
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
 *   <li><code>id</code> - Optional. There may be one <em>id</em> column that contains string values used as node id.
 *          If the schema does not specify an <em>id</em>, then the ids of the nodes are automatically
 *          generated.
 *   <li><code>type</code> - Optional. There may be one <em>type</em> column.
 *     The values in the corresponding column must be either 'directed', 'undirected' or 'mutual'.
 *     If the schema does not specify a <em>type</em>, then the edge type is the value for
 *     <em>{@link parseOptions.defaultEdgeType}</em>.
 *   <li><code>label</code> - Optional. There may be one <em>label</em> column. The corresponding column must contain
 *          string values. These values are used as the label of the respective edge. If the
 *          schema does not specify a label, then the edge ids are also used as the edge labels.
 *   <li><code>source</code> - There must be one <em>source</em> column that contains the ids of the edges' source nodes.
 *   <li><code>target</code> - There must be one <em>target</em> column that contains the ids of the edges' target nodes.
 *   <li><code>weight</code> - Optional. There may be one <em>weight</em> column which contains numerical values which are
 *          set as `weight` on the edges.
 * </ul>
 */

/**
 * @typedef {Object} edgeSchemaObj - Specifies an attribute or viz element in the edge schemas.
 *
 * @property {string} target - The target is either <code>attributes</code> or <code>viz</code>.
 *
 *
 * <p>The <em>target</em> determines which <em>id</em> and <em>type</em> values you may provide.<br>
 *
 * When the <em>target</em> is <code>attributes</code> then the <em>id</em> and <em>title</em> can
 * be any string and the <em>type</em> must be one of:
 * <ul>
 *   <li><code>string</code> - An attribute of type string.</li>
 *   <li><code>integer</code> - The values in the corresponding column are parsed using {@link parseInt}.</li>
 *   <li><code>float</code> - The values in the corresponding column are parsed using {@link parseFloat}.</li>
 *   <li><code>boolean</code> - True when the value is either <code>true</code> (case-insensitive)
 *     or <code>1</code>, and false for all other values.</li>
 * </ul>
 *
 * <p>When the <em>target</em> is <code>viz</code> then the <em>id</em> must be either
 * <code>color</code>, <code>thickness</code> or <code>shape</code>. The type
 * is implied by the <em>id</em> and is thus ignored. The values are to be given as follows:
 * <ul>
 *   <li><code>color</code>: The RGB values expressed like <code>rgb(255,204,0)</code>.</li>
 *   <li><code>thickness</code>: A number. The default is 1.0.</li>
 *   <li><code>shape</code>: Either <code>solid</code>, <code>dotted</code>, <code>dashed</code>,
 *     or <code>double</code>.</li>
 * </ul></p>
 *
 * @property {string} [id] - Optional. The id of the attribute or viz setting. When the id is not
 *          given for an attribute, then the header of the corresponding column in the CSV file is
 *          used.
 *
 * @property {string} [title] - Optional. The title of the attribute. When the title is not given,
 *          then the <em>id</em> is used.
 *
 * @property {string} [type] - The type of the value.
 */

/**
 * @typedef {Object} parseOptions - The options passed to the {@link csv.parse} function.
 * @see {@link http://csv.adaltas.com/parse/}.
 */

// -------------------------------------------------------------------------------------------------
// Exported convert function:

/**
 * Returns a promise that converts the data in the given CSV documents to a GEXF document. This
 * promise resolves to the resulting gexf object.
 * @param {config} config - The configuration object.
 * @returns {Promise}
 * @public
 */
exports.convert = function (config) {
    var nodeRecords;
    var edgeRecords;

    return loadCSV(config.nodes, true)
        .then(function (records) {
            //console.log(records);
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
                //console.log(err, records);
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
    for (var reci = 1; reci < records.length; reci++) {
        var record = records[reci];
        record[header] = parseFn(record[header]);
    }
}

function assertColumn(records, header, assertFn) {
    for (var reci = 1; reci < records.length; reci++) {
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
        //console.log('model:', config.graphParams.model);

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
        //console.log(spec, typeof spec == 'object', spec.target == 'attributes');
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
    for (var reci = 1; reci < records.length; reci++) {
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
    for (var reci = 1; reci < records.length; reci++) {
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
        if (edge.id === undefined) { edge.id = `e${coli + 1}`; }
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
        //console.log('gexf:', string);
        fs.writeFile(path, string, function (err) {
            if (err) { return reject('Failed to save the Gexf file. ${err}'); }
            resolve(gexfObj);
        });
    });
}
