<?php

	// complete all params into one array
	$params = array_merge($_GET, $_POST);
	
	// if there is any sleep param - sleep stript
	if (isset($params['sleep'])) {
		$seconds = intval($params['sleep']);
		sleep($seconds);
	}
	
	// send xml string with proper http headers
	header("HTTP/1.0 404 Not Found");
	die();