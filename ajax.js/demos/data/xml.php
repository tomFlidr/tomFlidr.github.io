<?php

	// load xml as string
	$books = file_get_contents(__DIR__ . '/books.xml');
	
	// complete all params into one array
	$params = array_merge($_GET, $_POST);
	
	// sometimes there is param under key "key2" from examples serialized in json - deserialize it
	if (isset($params['key2'])) {
		$params['key2'] = json_decode($params['key2']);
	}
	
	// if there is any sleep param - sleep stript
	if (isset($params['sleep'])) {
		$seconds = intval($params['sleep']);
		sleep($seconds);
	}
	
	// init formating function to convert php array and stdClass into xml string
	function formatParams ($data, $level = 2) {
		$s = ''; $indent = ''; $i = 0;
		while ($i++ < $level) $indent .= "\t";
		foreach ($data as $key => $value) {
			$nodeName = is_numeric($key) ? 'item' : $key;
			if (gettype($value) == 'string') {
				$s .= $indent.'<'.$nodeName.'>'.$value.'</'.$nodeName.'>'."\n";
			} else {
				$s .= $indent.'<'.$nodeName.'>'."\n".formatParams($value, $level + 1).$indent.'</'.$nodeName.'>'."\n";
			}
		}
		return $s;
	}
	
	// convert all sended params into xml string
	$paramsStr = formatParams($params);
	
	// process replacements on raw xml string
	// - wrap <books> node into new root node and prepend into root node params xml string
	$out = str_replace(
		array("\t", "<books>", "</books>",),
		array("\t\t", "<data>\n\t<params>\n".$paramsStr."\t</params>\n\t<books>", "\t</books>\n</data>",),
		$books
	);
	
	// send xml string with proper http headers
	header('Content-Type: application/xml; charset=utf-8');
	header('Content-Length: ' . strlen($out));
	echo $out;