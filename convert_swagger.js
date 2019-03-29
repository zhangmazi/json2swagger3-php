function getVersion() {
	var version = '1.0.2';
	var build = '20190330';

	return {'version':version, 'build':build};
}

function showVersion(argument) {
	var info = getVersion();

	document.write('Ver:'+ info['version'] +' B'+ info['build']);
}
function convert() {
	// ---- Global variables ----
	var source_request, source_response, inJSON, outSwagger, tabCount, indentator, prefixStar;
	outSwagger = '';
	prefixStar = '     *    ';

	var OA_FLAG = '@OA\\';
	var STR_TAB = '    ';


	const DESC_MAP ={
	    "id" : "ID流水号" ,
	    "created_at":"创建时间",
	    "updated_at" : "更新时间",
	    "deleted_at" : "删除时间",
	    "sort_order" : "显示顺序",
	    "order_num" : "显示顺序",
	    "email" : "邮件地址",
	    "phone" :"手机号",
	    "cellphone":"手机号",
	    "status" : "状态",
	    "amount":"数量",
	    "name":"姓名",
	    "title":"标题",
	    "description":"描述",
	    "memo":"备注",
    	"remark":"备注",
    	"current_page":"当前页码",
    	"total":"总量",
    	"per_page":"分页尺码"
	}

	function mapDesc(k)
	{
		if (DESC_MAP.hasOwnProperty(k)) {
			return DESC_MAP[k];
		} else {
			return '';
		}
	}

	// ---- Functions definitions ----
	function changeIndentation(count) {
		/* 
  Assign 'indentator' a string beginning with newline and followed by 'count' tabs
  Updates variable 'tabCount' with the number of tabs used
  Global variables updated: 
  -identator 
  -tabcount
  */

		let i;
		if (count >= tabCount) {
			i = tabCount
		} else {
			i = 0;
			indentator = '\n' + prefixStar;
		}
		for (; i < count; i++) {
			indentator += STR_TAB;
		}
		//Update tabCount
		tabCount = count;
	};

	function conversorSelection(obj, prop) {
		/* 
    Selects which conversion method to call based on given obj
  Global variables updated: 
    -outSwagger
    */

		changeIndentation(tabCount + 1);
		if (typeof obj === "number") { //attribute is a number
			convertNumber(obj, prop);
		} else if (Object.prototype.toString.call(obj) === '[object Array]') { //attribute is an array
			convertArray(obj[0]);
		} else if (typeof obj === "object") { //attribute is an object
			convertObject(obj);
		} else if (typeof obj === "string") { //attribute is a string
			convertString(obj, prop);
		} else if (typeof obj === "boolean") { // attribute is a boolean
			outSwagger += indentator + 'type="boolean"';
		} else { // not a valid Swagger type
			alert('Property type "' + typeof obj + '" not valid for Swagger definitions');
		}
		changeIndentation(tabCount - 1);
	};

	function convertNumber(num, prop) {
		/* 
    Append to 'outSwagger' string with Swagger schema attributes relative to given number
    Global variables updated: 
    -outSwagger
    */
		let str_star = '';
		if (num % 1 === 0) {
			outSwagger += indentator + str_star + 'type="integer",';
			if (num < 2147483647 && num > -2147483647) {
				outSwagger += indentator + str_star + 'format="int32"';
			} else if (Number.isSafeInteger(num)) {
				outSwagger += indentator + str_star + 'format="int64"';
			} else {
				outSwagger += indentator + str_star + 'format="unsafe"';
			}
		} else {
			outSwagger += indentator + str_star + 'type="number"';
		}
		outSwagger += "," + indentator + str_star + 'example="'+ num +'"';
		outSwagger += "," + indentator + str_star + 'description="'+ mapDesc(prop) +'"';

	};

	//date is ISO8601 format - https://xml2rfc.tools.ietf.org/public/rfc/html/rfc3339.html#anchor14
	function convertString(str, prop) {
		/* 
    Append to 'outSwagger' string with Swagger schema attributes relative to given string
    Global variables updated: 
    -outSwagger
    */

		let regxDate = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
		regxDateTime = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01]).([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\.[0-9]{1,2})?(Z|(\+|\-)([0-1][0-9]|2[0-3]):[0-5][0-9])$/;

		outSwagger += indentator + 'type="string"';
		if (regxDateTime.test(str)) {
			outSwagger += ',';
			outSwagger += indentator + 'format="date-time"';
		} else if (regxDate.test(str)) {
			outSwagger += ',';
			outSwagger += indentator + 'format="date"';
		}
		outSwagger += "," + indentator + 'example="'+ str +'"';
		outSwagger += "," + indentator + 'description="'+ mapDesc(prop) +'"';
	};

	function convertArray(obj) {
		/* 
    Append to 'outSwagger' string with Swagger schema attributes relative to given array
    Global variables updated: 
    -outSwagger
    */
    //debugger;

		outSwagger += indentator + 'type="array",description="",';
		// ---- Begin items scope ----
		outSwagger += indentator + OA_FLAG + 'Items(';
		if (obj) {
			//outSwagger += indentator + 'items: {';
			conversorSelection(obj);
		}
		outSwagger += indentator + '),';
		// ---- End items scope ----
	};

	function convertObject(obj) {
		/* 
    Append to 'outSwagger' string with Swagger schema attributes relative to given object
    Global variables updated: 
    -outSwagger
    */

		//Convert null attributes to given type
		if (obj === null) {
			outSwagger += indentator + 'type="string",description="",';
			outSwagger += indentator + 'format="nullable"';
			return;
		}
		// ---- Begin properties scope ----
		outSwagger += indentator + 'type="object",';
		changeIndentation(tabCount + 1);
		//For each attribute inside that object
		for (var prop in obj) {
			// ---- Begin property type scope ----
			outSwagger += indentator + OA_FLAG + 'Property(property="' + prop + '",';
			conversorSelection(obj[prop], prop);
			outSwagger += indentator + '),'
			// ---- End property type scope ----
		}

		changeIndentation(tabCount - 1);
		if (Object.keys(obj).length > 0) { //At least 1 property inserted
			outSwagger = outSwagger.substring(0, outSwagger.length - 1); //Remove last comma
			outSwagger += indentator + '),'
		} else { // No property inserted
			outSwagger += ' }';
		}
	};

	function format(value, yaml) {
		/*
  Convert JSON to YAML if yaml checkbox is checked
  Global variables updated:
  NONE
  */
		if (yaml) {
			return value.replace(/[{},"]+/g, '').replace(/\t/g, '  ').replace(/(^ *\n)/gm, '');
		} else {
			return value
		}
	}

	// ---- Execution begins here ----
	source_request = document.querySelector("#source_request").value;
	source_response = document.querySelector("#source_response").value;

	if (source_request.length > 0) {
		try {
			source_request = JSON.parse(source_request);
		} catch(e) {
			alert("请求json格式无效!\n(" + e + ")");
			return;
		}
	}

	if (source_response.length > 0) {
		try {
			source_response = JSON.parse(source_response);
		} catch(e) {
			alert("响应json格式无效!\n(" + e + ")");
			return;
		}

	}
	// 开始转request
	tabCount = 0;
	indentator = "\n" + prefixStar;

	outSwagger += prefixStar + OA_FLAG + 'Get(';
	changeIndentation(1);
	outSwagger += indentator + 'path="/just/one/demo/{flag}",';
	outSwagger += indentator + 'summary="接口概要",';
	outSwagger += indentator + 'description="接口详细描述",';
	outSwagger += indentator + 'tags={"接口分类"},';
	//For each object inside the JSON
	if (source_request) {
		outSwagger += indentator + OA_FLAG + 'Parameter(';
		outSwagger += indentator + STR_TAB + 'name="page",';
		outSwagger += indentator + STR_TAB + 'in="query",';
		outSwagger += indentator + STR_TAB + 'required=true,';
		outSwagger += indentator + STR_TAB + 'description="当前页",';
		outSwagger += indentator + STR_TAB + OA_FLAG + 'Schema(';
		outSwagger += indentator + STR_TAB + STR_TAB + 'type="integer",';
		outSwagger += indentator + STR_TAB + STR_TAB + 'default="1",';
		outSwagger += indentator + STR_TAB + STR_TAB + 'description="当前多少页码",';
		outSwagger += indentator + STR_TAB + '),';
		outSwagger += indentator + '),';
		outSwagger += indentator + OA_FLAG + 'Parameter(';
		outSwagger += indentator + STR_TAB + 'name="flag",';
		outSwagger += indentator + STR_TAB + 'in="path",';
		outSwagger += indentator + STR_TAB + 'required=true,';
		outSwagger += indentator + STR_TAB + 'description="标识",';
		outSwagger += indentator + STR_TAB + OA_FLAG + 'Schema(';
		outSwagger += indentator + STR_TAB + STR_TAB + 'type="string",';
		outSwagger += indentator + STR_TAB + STR_TAB + 'default="zhangmazi",';
		outSwagger += indentator + STR_TAB + STR_TAB + 'description="用户ID描述",';
		outSwagger += indentator + STR_TAB + '),';
		outSwagger += indentator + '),';
		outSwagger += indentator + OA_FLAG + 'RequestBody(';
		outSwagger += indentator + STR_TAB + OA_FLAG + 'MediaType(';
		outSwagger += indentator + STR_TAB + STR_TAB + 'mediaType="application/json",';
		changeIndentation(2);
		outSwagger += indentator + STR_TAB +  OA_FLAG + 'Schema(';
		changeIndentation(4);
		for (var obj in source_request) {
			// ---- Begin schema scope ----
			outSwagger += indentator + ' ' + OA_FLAG + 'Property(property="' + obj + '",';
			conversorSelection(source_request[obj]);
			outSwagger += indentator + '),';
			// ---- End schema scope ----
		}
		changeIndentation(tabCount - 1);
		outSwagger += indentator + '),';
		changeIndentation(tabCount - 1);
		outSwagger += indentator + '),';
	changeIndentation(1);
	outSwagger += indentator + '),';
		//Remove last comma
		// ---- End definitions ----

	}
	// 结束转request

	// 开始转response
	//For recursive functions to keep track of the tab spacing
	tabCount = 0;
	indentator = "\n" + prefixStar;

	// ---- Begin definitions ----
	changeIndentation(1);
	outSwagger += indentator + OA_FLAG + 'Response(';
	outSwagger += indentator + STR_TAB + 'response=200,';
	outSwagger += indentator + STR_TAB + 'description="返回正确",';
	//For each object inside the JSON
	if (source_response) {
		outSwagger += indentator + STR_TAB + OA_FLAG + 'MediaType(';
		outSwagger += indentator + STR_TAB + STR_TAB + 'mediaType="application/json",';
		changeIndentation(2);
		outSwagger += indentator +  OA_FLAG + 'Schema(';
		changeIndentation(3);
		for (var obj in source_response) {
			// ---- Begin schema scope ----
			outSwagger += indentator + ' '+ OA_FLAG +'Property(property="' + obj + '",';
			conversorSelection(source_response[obj]);
			outSwagger += indentator + '),';
			// ---- End schema scope ----
		}
		changeIndentation(tabCount - 1);
		outSwagger += indentator + '),';
		outSwagger += indentator + '),';
		//Remove last comma
		outSwagger = outSwagger.substring(0, outSwagger.length - 1);
		// ---- End definitions ----

	}
	changeIndentation(1);
	outSwagger += indentator + '),';
	outSwagger += "\n" + prefixStar + '),';
	
	outSwagger = outSwagger.substring(0, outSwagger.length - 1);


	// 结束转response


	document.querySelector("#target_result").value = format(outSwagger, false);
}