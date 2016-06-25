<?php

	$books = json_decode(file_get_contents(__DIR__ . '/books.json'));
	$params = array_merge($_GET, $_POST);
	$out = json_encode(array('params' => $params, 'books' => $books));
	header('Content-Type: application/json; charset=utf-8');
	header('Content-Length: ' . strlen($out));
	echo $out;