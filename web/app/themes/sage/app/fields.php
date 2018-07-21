<?php

namespace App;

use Carbon_Fields\Container;
use Carbon_Fields\Field;

/**
 * Define custom fields
 * Docs: https://carbonfields.net/docs/
 */
add_action('carbon_fields_register_fields', function () {
    Container::make('post_meta', 'Datas')
        ->where('post_type', '=', 'page')
        ->where('post_id', '=', get_option('page_on_front'))
        ->add_fields([
            Field::make('complex', 'jams')
            ->add_fields([
                Field::make('text', 'artist'),
                Field::make('text', 'link'),
            ]),
            Field::make('complex', 'connects')
            ->add_fields([
                Field::make('text', 'name'),
                Field::make('text', 'link'),
            ]),
        ]);
});

/**
 * Boot Carbon Fields
 */
add_action( 'after_setup_theme', function () {
    \Carbon_Fields\Carbon_Fields::boot();
});
