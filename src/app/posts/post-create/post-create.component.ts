import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { copyFile } from 'fs';
import { PostModel } from 'src/app/shared/models/posrtModel';
import { PostService } from 'src/app/shared/services/post.service';

@Component({
  selector: '[app-post-create]',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],
})
export class PostCreateComponent implements OnInit {
  enteredTitle = '';
  enteredContent = '';
  postToBeEdited!: PostModel;
  isLoading = false;
  imageUrlPreview!: string;
  private mode = 'create';
  private postId!: string;
  form: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    content: new FormControl('', [Validators.required]),
    image: new FormControl(null, [Validators.required]),
  });

  constructor(
    private postService: PostService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.setUpSubscriptions();
  }

  onSubmitPost() {
    if (this.form.invalid) return;
    this.isLoading = true;
    if (this.mode == 'create') this.addNewPost();
    else this.editPost();
    this.form.reset();
  }

  addNewPost() {
    const post: PostModel = {
      id: '',
      title: this.form.value.title,
      content: this.form.value.content,
    };
    this.postService.addPost(post);
  }

  editPost() {
    const post: PostModel = {
      id: '',
      title: this.form.value.title,
      content: this.form.value.content,
    };
    this.postService.updatePost(this.postId, post);
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files as FileList;

    this.form.patchValue({ image: file[0] });
    this.form.get('image')?.updateValueAndValidity();

    const reader = new FileReader();
    reader.onload = () => {
      this.imageUrlPreview = reader.result as string;
    };

    reader.readAsDataURL(file[0]);
  }

  setUpSubscriptions() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.isLoading = true;
        this.mode = 'edit';
        this.postId = paramMap.get('postId') || '';
        this.postService.getPostById(this.postId).subscribe((res) => {
          this.postToBeEdited = {
            id: res.post._id,
            title: res.post.title,
            content: res.post.content,
          };
          this.form.setValue({
            title: res.post.title,
            content: res.post.content,
            image: null,
          });
          this.isLoading = false;
        });
      } else {
        this.mode = 'create';
        this.postId = '';
        this.postToBeEdited = { id: '', title: '', content: '' };
      }
    });
  }
}
