<?php

	$out = file_get_contents(__DIR__ . '/books.xml');
	header('Content-Type: application/xml; charset=utf-8');
	header('Content-Length: ' . strlen($out));
	echo $out;