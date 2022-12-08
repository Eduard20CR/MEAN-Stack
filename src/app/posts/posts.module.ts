import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostCreateComponent } from './post-create/post-create.component';
import { PostListComponent } from './post-list/post-list.component';
import { AngularMaterialModule } from '../angular-material/angular-material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PostsRoutingModule } from './posts-routing.module';

@NgModule({
  declarations: [PostCreateComponent, PostListComponent],
  imports: [
    CommonModule,
    AngularMaterialModule,
    ReactiveFormsModule,
    RouterModule,
    PostsRoutingModule,
  ],
  exports: [PostCreateComponent, PostListComponent],
})
export class PostsModule {}
