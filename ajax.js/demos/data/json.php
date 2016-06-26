<?php

	// load raw json from hard drive
	$books = json_decode(file_get_contents(__DIR__ . '/books.json'));
	
	// complete all params into one array
	$params = array_merge($_GET, $_POST);
	
	// if there is any sleep param - sleep stript
	if (isset($params['sleep'])) {
		$seconds = intval($params['sleep']);
		sleep($seconds);
	}
	
	// sometimes there is param under key "key2" from examples serialized in json - deserialize it
	if (isset($params['key2'])) {
		$params['key2'] = json_decode($params['key2']);
	}
	
	// encode all variables into one json string
	$out = json_encode(
		array(
			'params'=> $params, 
			'json'	=> $books,
		)
	);
	
	// send json result string with proper http headers
	header('Content-Type: application/json; charset=utf-8');
	header('Content-Length: ' . strlen($out));
	echo $out;