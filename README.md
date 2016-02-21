
# csv2gexf

> Convert graph data in CSV documents to a GEXF document.

The current version (0.0.2) does not support dynamic nor hierarchical graphs.


## Getting started

First install [NodeJS](https://nodejs.org) (version 5.6.0 or higher).

Then install the dependencies for this package:

```shell
$ npm install
```


## CSV Documents

The graph data is loaded from two CSV documents. The first should contain the nodes data, the second the edges data. The data must respect the following requirements.

Both CSV files should contain headers.


### Nodes CSV file
- One column should contain unique node ids.
- One column may contain the node labels.
- All other columns are either node attributes or visualizaton settings.
    - Attributes may be arbitrary values of type string, int, float or boolean.
    - Visualization settings must be either:
        - A color expressed as RGB components in the form `rgb(<r>,<g>,<b>)`, where `<r>`, `<g>` and `<b>` are integer values in the range [0–255].
        - A size expressed as a decimal scale. The default is 1.0.
        - A shape, which must be either `disc`, `square`, `triangle`, or `diamond`.

#### Edges CSV file
- One column should contain the source node ids.
- One column should contain the target node ids.
- One column may contain unique edge ids.
- One column may contain the edge labels.
- One column may contain the edge types, which must be either `directed`, `undirected` or `mutual`.
- One column may contain the edge weights, which must be (decimal) numbers.
- All other columns are either edge attributes or visualizaton settings.
    - Attributes may be arbitrary values of type string, int, float or boolean.
    - Visualization settings must be either:
        - A color expressed as RGB components in the form `rgb(<r>,<g>,<b>)`, where `<r>`, `<g>` and `<b>` are integer values in the range [0–255].
        - A thickness expressed as a (decimal) number. The default is 1.0.
        - A shape, which must be either `solid`, `dotted`, `dashed`, or `double`.


## Configuration and schemas

To convert the CSV data to a GEXF document you will need to call the `csv2gexf.convert` function in this package.
This function takes a configuration object as sole argument. This object contains settings such as where to save the resulting GEXF file. It also contains schema that specify the nature of the columns in the CSV tables. These schema are arrays which contain one item for each column in the order of the columns. Each item is either a string or an object. The strings are used to mark the columns that contain primary node or edges properties such as id, label, source, target, type and weight. Some of these are required, others are optional. The objects are used for columns that contain arbitrary attributes or visualization settings. The format of the configuration object is [documented in the API Reference](#csv2gexfconfig--object).


## Example

See `./example/start.js` for an example of how to use the convertor. This example loads the CSV files in `./example/csv/` and writes the resulting Gexf document as `result.gexf` in the `./example` directory.

Run this examples:

```shell
$ npm run example
```

## Dependencies

- [csv for NodeJS](https://www.npmjs.com/package/csv)
- [Gexf library for JavaScript](https://www.npmjs.com/package/gexf)
- [jsdoc-to-markdown](https://www.npmjs.com/package/jsdoc-to-markdown)


## API Reference
**Author:** Wouter Van den Broeck  
**Copyright**: 2016  
<a name="module_csv2gexf.convert"></a>
### csv2gexf.convert(config) ⇒ <code>Promise</code>
Returns a promise that converts the data in the given CSV documents to a GEXF document. When
`config.saveAs` is provided then this promise resolves to the path of the resulting GEXF file,
else it resolves to the resulting Gexf object.

**Kind**: static method of <code>[csv2gexf](#module_csv2gexf)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>config</code> | The configuration object. |

<a name="module_csv2gexf..config"></a>
### csv2gexf~config : <code>Object</code>
The options object for the convert method.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**See**: convert  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| graphParams | <code>graphParams</code> | The parameters object that is passed to the `gexf.create`          method. |
| nodes | <code>nodesConfig</code> | The options for processing the nodes CSV document. |
| edges | <code>edgesConfig</code> | The options for processing the edges CSV document. |
| saveAs | <code>string</code> | Optional. The path of the GEXF file to save the result in. |

<a name="module_csv2gexf..graphParams"></a>
### csv2gexf~graphParams : <code>Object</code>
The parameters object that is passed to the `gexf.create` method.
         Some of these parameters are specified below. Consult the
         [Gexf documentation](https://www.npmjs.com/package/gexf#instantiation) for the
         other potential parameters. Note that you should not provide a _model_ as this is
         derived from the _nodeSchema_ and _edgeSchema_ objects.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| defaultEdgeType | <code>string</code> | The type for all edges when there is no _type_ in the          edge schema. The type must be either `directed`, `undirected` or `mutual`. |
| meta | <code>metadata</code> | Provides additional information about the graph. |

<a name="module_csv2gexf..metadata"></a>
### csv2gexf~metadata : <code>Object</code>
Provides additional information about the graph. It can specify
         the _lastmodifieddate_ or any additional arbitrary property. The values must be
         strings. Each arbitrary property is added as an child element in the `meta`
         element in the _gexf_ document. The property's name is used as element name and
         the value as the element's innerHtml.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| lastmodifieddate | <code>string</code> | A date formatted as an international standard          date (yyyy-mm-dd), e.g. `'2009−03−20'`. Sets the value of the `lastmodifieddate`          attribute of the `meta` element in the _gexf_ document. |

<a name="module_csv2gexf..nodesConfig"></a>
### csv2gexf~nodesConfig : <code>Object</code>
The options for processing the nodes CSV document.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | The path to the nodes CSV file. |
| nodeSchema | <code>nodeSchema</code> | Specifies the column types. |
| parseOptions | <code>parseOptions</code> | The options passed to the `csv.parse` function. |

<a name="module_csv2gexf..edgesConfig"></a>
### csv2gexf~edgesConfig : <code>Object</code>
The options for processing the edges CSV document.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| file | <code>string</code> | The path to the nodes CSV file. |
| edgeSchema | <code>edgeSchema</code> | Specifies the column types. |
| parseOptions | <code>parseOptions</code> | The options passed to the `csv.parse` function. |

<a name="module_csv2gexf..nodeSchema"></a>
### csv2gexf~nodeSchema : <code>Array.&lt;nodeSchemaEl&gt;</code>
An array of type specifications. There should be one type
         specifications string for each column.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
<a name="module_csv2gexf..nodeSchemaEl"></a>
### csv2gexf~nodeSchemaEl : <code>string</code> &#124; <code>nodeSchemaObj</code>
Must either be one of the following strings or a
         schema element object.<br>
The valid type strings are:
<ul>
  <li>`id` - There must be one _id_ column that contains string values used as
    node id.</li>
  <li>`label` - Optional. There may be one _label_ column. The corresponding
    column must contain string values. These values are used as the label of the respective node.
    If the schema does not specify a label, then the node ids are also used as the node
    labels.</li>
</ul>

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
<a name="module_csv2gexf..nodeSchemaObj"></a>
### csv2gexf~nodeSchemaObj : <code>Object</code>
Specifies an attribute or viz element in the node schemas.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| target | <code>string</code> | The target is either `attributes` or `viz`. <p>The _target_ determines which _id_ and _type_ values you may provide.<br> When the _target_ is `attributes` then the _id_ and _title_ can be any string and the _type_ must be one of: <ul>   <li>`string` - An attribute of type string.</li>   <li>`integer` - The values in the corresponding column are parsed using `parseInt`.</li>   <li>`float` - The values in the corresponding column are parsed using `parseFloat`.</li>   <li>`boolean` - True when the value is either `true` (case-insensitive)     or `1`, and false for all other values.</li> </ul> <p>When the _target_ is `viz` then the _id_ must be either `color`, `size` or `shape`. The type is implied by the _id_ and is thus ignored. The values are to be given as follows: <ul>   <li>`color`: The RGB values expressed like `rgb(255,204,0)`.</li>   <li>`size`: A number that determines the scale. Default is 1.0.</li>   <li>`shape`: Either `disc`, `square`, `triangle`,     or `diamond`</li>. </ul></p> |
| id | <code>string</code> | Optional. The id of the attribute or viz setting. When the id is not          given for an attribute, then the header of the corresponding column in the CSV file is          used. |
| title | <code>string</code> | Optional. The title of the attribute. When the title is not given,          then the _id_ is used. |
| type | <code>string</code> | The type of the value. |

<a name="module_csv2gexf..edgeSchema"></a>
### csv2gexf~edgeSchema : <code>Array.&lt;edgeSchemaEl&gt;</code>
An array of type specifications. There should be one type
         specifications string for each column.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
<a name="module_csv2gexf..edgeSchemaEl"></a>
### csv2gexf~edgeSchemaEl : <code>string</code> &#124; <code>edgeSchemaObj</code>
Must either be one of the following strings or a
         schema element object.<br>
The valid type strings are:
<ul>
  <li>`id` - Optional. There may be one _id_ column that contains string values used as node id.
         If the schema does not specify an _id_, then the ids of the nodes are automatically
         generated.
  <li>`type` - Optional. There may be one _type_ column.
    The values in the corresponding column must be either 'directed', 'undirected' or 'mutual'.
    If the schema does not specify a _type_, then the edge type is the value for
    `parseOptions.defaultEdgeType`.
  <li>`label` - Optional. There may be one _label_ column. The corresponding column must contain
         string values. These values are used as the label of the respective edge. If the
         schema does not specify a label, then the edge ids are also used as the edge labels.
  <li>`source` - There must be one _source_ column that contains the ids of the edges' source nodes.
  <li>`target` - There must be one _target_ column that contains the ids of the edges' target nodes.
  <li>`weight` - Optional. There may be one _weight_ column which contains numerical values which are
         set as `weight` on the edges.
</ul>

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
<a name="module_csv2gexf..edgeSchemaObj"></a>
### csv2gexf~edgeSchemaObj : <code>Object</code>
Specifies an attribute or viz element in the edge schemas.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| target | <code>string</code> | The target is either `attributes` or `viz`. <p>The _target_ determines which _id_ and _type_ values you may provide.<br> When the _target_ is `attributes` then the _id_ and _title_ can be any string and the _type_ must be one of: <ul>   <li>`string` - An attribute of type string.</li>   <li>`integer` - The values in the corresponding column are parsed using `parseInt`.</li>   <li>`float` - The values in the corresponding column are parsed using `parseFloat`.</li>   <li>`boolean` - True when the value is either `true` (case-insensitive)     or `1`, and false for all other values.</li> </ul> <p>When the _target_ is `viz` then the _id_ must be either `color`, `thickness` or `shape`. The type is implied by the _id_ and is thus ignored. The values are to be given as follows: <ul>   <li>`color`: The RGB values expressed like `rgb(255,204,0)`.</li>   <li>`thickness`: A number. The default is 1.0.</li>   <li>`shape`: Either `solid`, `dotted`, `dashed`,     or `double`.</li> </ul></p> |
| id | <code>string</code> | Optional. The id of the attribute or viz setting. When the id is not          given for an attribute, then the header of the corresponding column in the CSV file is          used. |
| title | <code>string</code> | Optional. The title of the attribute. When the title is not given,          then the _id_ is used. |
| type | <code>string</code> | The type of the value. |

<a name="module_csv2gexf..parseOptions"></a>
### csv2gexf~parseOptions : <code>Object</code>
The options passed to the `csv.parse` function.

**Kind**: inner typedef of <code>[csv2gexf](#module_csv2gexf)</code>  
**See**: [http://csv.adaltas.com/parse/](http://csv.adaltas.com/parse/).  

* * *

&copy; 2016, Wouter Van den Broeck
